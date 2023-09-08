import { DateTime } from "luxon"
import { customAlphabet } from "nanoid"
import { https, Request, Response } from "firebase-functions"
import { BaseModel } from "@careerfairy/shared-lib/BaseModel"
import { ClientError } from "graphql-request"
import * as crypto from "crypto"
import { promisify } from "util"
import * as zlib from "zlib"
import {
   LivestreamEvent,
   LiveStreamEventWithUsersLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import { ReminderData } from "./reminders"
import functions = require("firebase-functions")
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { ATSPaginatedResults } from "@careerfairy/shared-lib/ats/Functions"
import type { Change } from "firebase-functions"
import { firestore } from "firebase-admin"
import DocumentSnapshot = firestore.DocumentSnapshot
import { Group } from "@careerfairy/shared-lib/groups"
import { UserData } from "@careerfairy/shared-lib/users"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"

export const setCORSHeaders = (req: Request, res: Response): void => {
   res.set("Access-Control-Allow-Origin", "*")
   res.set("Access-Control-Allow-Credentials", "true")

   if (req.method === "OPTIONS") {
      // Send response to OPTIONS requests
      res.set("Access-Control-Allow-Methods", "GET")
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
      res.set("Access-Control-Max-Age", "3600")
      res.status(204).send("")
      return
   }
}

export type IGenerateEmailDataProps = {
   stream: LiveStreamEventWithUsersLivestreamData
   reminder?: ReminderData
   emailMaxChunkSize: number
   minutesToRemindBefore?: number
}

/**
 * Generate a dynamic reminder email using a stream and user registered data
 *
 */
export const generateReminderEmailData = ({
   stream,
   reminder,
   minutesToRemindBefore,
   emailMaxChunkSize,
}: IGenerateEmailDataProps): MailgunMessageData[] => {
   const { company, start, registeredUsers, timezone } = stream

   if (!start || !registeredUsers?.length) {
      return []
   }

   const luxonStartDate = DateTime.fromJSDate(start.toDate(), {
      zone: timezone || "Europe/Zurich",
   })

   let formattedDate = luxonStartDate.toLocaleString(DateTime.DATETIME_FULL)
   formattedDate = dateFormatOffset(formattedDate) // add parentheses to offset

   const dateToDelivery = minutesToRemindBefore
      ? luxonStartDate.minus({ minutes: minutesToRemindBefore }).toRFC2822()
      : "0"

   const templateData = createRecipientVariables(
      stream,
      start.toDate(),
      reminder.timeMessage
   )

   // Mailgun has a maximum of 1k emails per bulk email
   // So we will slice our registered users on chunks of 950 and send more than one bulk email if needed
   const registeredUsersChunks = getRegisteredUsersIntoChunks(
      registeredUsers,
      emailMaxChunkSize
   )

   const subjectMap: Record<ReminderData["key"] | "fallback", string> = {
      reminder5Minutes: `🔥 NOW: Meet ${company} Live!`,
      reminder1Hour: `🔥 Reminder: Meet ${company} in 1 hour!`,
      reminder24Hours: `🔥 Reminder: Meet ${company} tomorrow!`,
      fallback: `🔥 Reminder: Live Stream with ${company} at ${formattedDate}`,
      reminderTodayMorning: "",
      reminderRecordingNow: "",
   }

   // create email data for all the registered users chunks
   return registeredUsersChunks.map((registeredUsersChunk) => {
      return {
         from: "CareerFairy <noreply@careerfairy.io>",
         to: registeredUsersChunk,
         subject: subjectMap[reminder.key] || subjectMap.fallback,
         template: reminder.template,
         "recipient-variables": JSON.stringify(templateData),
         "o:deliverytime": dateToDelivery,
      }
   })
}

export const generateNonAttendeesReminder = ({
   stream,
   emailMaxChunkSize,
   reminder,
}: IGenerateEmailDataProps): MailgunMessageData[] => {
   const { timezone, usersLivestreamData, company } = stream

   const sendReminderNow = reminder.key === "reminderRecordingNow"

   const todayAt10UTC = new Date()
   todayAt10UTC.setHours(10, 0, 0)

   // date to delivery should be today at 11 AM Zurich time by default
   const dateToDelivery = DateTime.fromJSDate(todayAt10UTC, {
      zone: timezone || "Europe/Zurich",
   })

   const nonAttendeesEmails = usersLivestreamData.map(
      ({ user }) => user.userEmail
   )

   const templateData = createNonAttendeesEmailData(stream)

   // Mailgun has a maximum of 1k emails per bulk email
   // So we will slice our registered users on chunks of 950 and send more than one bulk email if needed
   const nonAttendeesChunks = getRegisteredUsersIntoChunks(
      nonAttendeesEmails,
      emailMaxChunkSize
   )

   // create email data for all the non attendees users chunks
   return nonAttendeesChunks.map((nonAttendeesChunk) => {
      return {
         from: "CareerFairy <noreply@careerfairy.io>",
         to: nonAttendeesChunk,
         subject: `🤫 ${company} : 4 days limited access to live stream recording!`,
         template: reminder.template,
         "recipient-variables": JSON.stringify(templateData),
         "o:deliverytime": sendReminderNow ? "0" : dateToDelivery.toRFC2822(),
      }
   })
}

/**
 * Slice Registered Users into chunks
 *
 */
const getRegisteredUsersIntoChunks = (
   registeredUsers: unknown[],
   chunkSize: number
): string[][] => {
   const registeredUsersChunks = []

   for (let i = 0; i < registeredUsers.length; i += chunkSize) {
      const chunk = registeredUsers.slice(i, i + chunkSize)
      registeredUsersChunks.push(chunk)
   }

   return registeredUsersChunks
}

/**
 * Create all the email template variables needed for the email data
 */
const createRecipientVariables = (
   stream: LiveStreamEventWithUsersLivestreamData,
   startDate: Date,
   timeMessage: string
) => {
   const {
      company,
      title,
      externalEventLink,
      speakers: [firstSpeaker],
      usersLivestreamData,
      id: streamId,
      language,
   } = stream

   const {
      firstName: speakerFirstName,
      lastName: speakerLastName,
      position: speakerPosition,
   } = firstSpeaker

   // Reduce over usersLivestreamData to be possible to get registered information and add it to the stream data
   return usersLivestreamData.reduce((acc, userLivestreamData) => {
      const { user } = userLivestreamData
      const { id: studentEmail, firstName, timezone } = user

      const luxonStartDate = DateTime.fromJSDate(startDate, {
         zone: timezone || "Europe/Zurich",
      })
      let formattedDate = luxonStartDate.toLocaleString(DateTime.DATETIME_FULL)
      formattedDate = dateFormatOffset(formattedDate) // add parentheses to offset

      const upcomingStreamLink = externalEventLink
         ? externalEventLink
         : makeLivestreamEventDetailsUrl(streamId)

      const emailData = {
         timeMessage: timeMessage,
         companyName: company,
         userFirstName: firstName,
         streamTitle: title,
         formattedDateTime: formattedDate,
         formattedSpeaker: `${speakerFirstName} ${speakerLastName}, ${speakerPosition}`,
         upcomingStreamLink: addUtmTagsToLink({
            link: upcomingStreamLink,
            campaign: "eventReminders",
            content: title,
         }),
         german: language?.code === "DE",
      }

      return {
         ...acc,
         [studentEmail]: emailData,
      }
   }, {})
}

/**
 * Create all the email template variables needed for the non attendees email data
 */
const createNonAttendeesEmailData = (
   stream: LiveStreamEventWithUsersLivestreamData
) => {
   const { usersLivestreamData, title, company, companyLogoUrl } = stream

   return usersLivestreamData.reduce((acc, userLivestreamData) => {
      const {
         livestreamId,
         user: { firstName, userEmail },
      } = userLivestreamData

      const emailData = {
         firstName,
         recordingLink: addUtmTagsToLink({
            link: makeLivestreamEventDetailsUrl(livestreamId),
            campaign: "reminderForRecording",
            content: title,
         }),
         companyName: company,
         livestreamTitle: title,
         imageUrl: companyLogoUrl,
      }

      return {
         ...acc,
         [userEmail]: emailData,
      }
   }, {})
}

export const addMinutesDate = (date: Date, minutes: number): Date => {
   return new Date(date.getTime() + minutes * 60000)
}

export const removeMinutesDate = (date: Date, minutes: number): Date => {
   return new Date(date.getTime() - minutes * 60000)
}

export const getArrayDifference = (array1: unknown[], array2: unknown[]) => {
   return array2.filter((element) => {
      return !array1.includes(element)
   })
}

export const makeRequestingGroupIdFirst = (
   arrayOfGroupIds = [],
   requestingGroupId: string
) => {
   let newArray = [...arrayOfGroupIds]
   if (!requestingGroupId) return newArray
   const RequestingGroupIsInArray = newArray.find(
      (groupId) => requestingGroupId === groupId
   )
   if (!RequestingGroupIsInArray) return newArray
   newArray = newArray.filter((groupId) => groupId !== requestingGroupId)
   newArray.unshift(requestingGroupId)
   return newArray
}

export const studentBelongsToGroup = (student: UserData, group: Group) => {
   // return (
   //    student && student.groupIds && student.groupIds.includes(group.groupId)
   // );
   if (group.universityCode) {
      return (
         student &&
         student.university &&
         student.university.code === group.universityCode
      )
   } else {
      return (
         student && student.groupIds && student.groupIds.includes(group.groupId)
      )
   }
}

export const convertPollOptionsObjectToArray = (pollOptionsObject) => {
   return Object.keys(pollOptionsObject).map((key) => ({
      ...pollOptionsObject[key],
      index: key,
   }))
}

export const stringMatches = (basString: string, stringsToMatch: string[]) => {
   return stringsToMatch.some(
      (stringToMatch) =>
         stringToMatch.toLowerCase().replace(/\s/g, "") ===
         basString.toLowerCase().replace(/\s/g, "")
   )
}

export const getRatingsAverage = (contentRatings) =>
   contentRatings.reduce((a, b) => {
      return a + b.rating || 0
   }, 0) / contentRatings.length

export const getDateString = (streamData: LivestreamEvent) => {
   const dateString =
      streamData &&
      streamData.start &&
      streamData.start.toDate &&
      streamData.start.toDate().toString()
   return dateString || ""
}

export const markStudentStatsInUse = (totalParticipants, groupData) => {
   return totalParticipants.map((student) => {
      // Only modify that stats in use prop when it hasn't been assigned yet
      if (!student.statsInUse) {
         return {
            ...student,
            statsInUse: studentBelongsToGroup(student, groupData),
         }
      } else return student
   })
}

export const createNestedArrayOfTemplates = (
   arrayOfTemplates: unknown[],
   chunkSize = 500
) => {
   const nestedArrayOfTemplates = []
   let i: number
   let j: number
   let tempArray: unknown[]
   for (i = 0, j = arrayOfTemplates.length; i < j; i += chunkSize) {
      tempArray = arrayOfTemplates.slice(i, i + chunkSize)
      nestedArrayOfTemplates.push(tempArray)
   }
   return nestedArrayOfTemplates
}

export const generateReferralCode = () => {
   // 1 generation per second (3600 signups per hour) would need ~32 years to have
   // a 1% chance of at least 1 collision https://zelark.github.io/nano-id-cc/
   const nanoid = customAlphabet(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      11
   )

   return nanoid()
}

export const partition = <T>(
   array: T[],
   compareFn: (el: T, index?: number) => boolean
): {
   matches: T[]
   noMatches: T[]
} => {
   return array.reduce(
      (acc, curr, currentIndex) => {
         acc[compareFn(curr, currentIndex) ? "matches" : "noMatches"].push(curr)
         return acc
      },
      { matches: [], noMatches: [] }
   ) as { matches: T[]; noMatches: T[] }
}

/**
 * Detect if we're running the emulators
 */
export const isLocalEnvironment = () => {
   return (
      process.env.FIREBASE_AUTH_EMULATOR_HOST ||
      process.env.FIREBASE_STORAGE_EMULATOR_HOST ||
      process.env.FIRESTORE_EMULATOR_HOST ||
      process.env.FUNCTIONS_EMULATOR ||
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
   )
}

export const isTestEnvironment = () => {
   return process.env.NODE_ENV === "test"
}

export const isProductionEnvironment = () => {
   return process.env.NODE_ENV === "production"
}

export const getBigQueryTablePrefix = () => {
   if (isProductionEnvironment()) {
      return ""
   }

   const prefix = process.env.BIGQUERY_TABLE_PREFIX || "unknown"

   return `_${prefix}`
}

export const logAxiosError = (error: any) => {
   functions.logger.error("Axios: JSON", error?.toJSON?.())
   if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      functions.logger.error("Axios: Error Response", {
         body: error.response.data,
         status: error.response.status,
         headers: error.response.headers,
      })
   } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      functions.logger.error(
         "Axios: Request made but no response was received",
         {
            request: error.request,
         }
      )
   } else {
      // Something happened in setting up the request that triggered an Error
      functions.logger.error(
         "Axios: Something happened in setting up the request that triggered an Error",
         error
      )
   }
}

/**
 * Logs the error and throws to force the function to stop and return an error
 * @param message
 * @param error
 * @param extraData
 */
export const logAxiosErrorAndThrow = (
   message: string,
   error: any,
   ...extraData: unknown[]
) => {
   functions.logger.error(message, extraData)
   logAxiosError(error)
   throw new functions.https.HttpsError("unknown", message)
}
/**
 * Logs the error and throws to force the function to stop and return an error
 * @param message
 * @param error
 * @param extraData
 */
export const logGraphqlErrorAndThrow = (
   message: string,
   error: any,
   ...extraData: unknown[]
) => {
   functions.logger.error(message, extraData)
   logGraphqlError(error)
   throw new functions.https.HttpsError("unknown", message)
}

export const logGraphqlError = (error: ClientError) => {
   functions.logger.error("GraphQL: Error", {
      message: error.message,
      name: error.name,
      stack: error.stack,
   })
}

type onCallFnHandler = (
   data: any,
   context: https.CallableContext
) => any | Promise<any>

/**
 * Function wrapper
 * Catches errors and improves logging for axios exceptions
 *  Helps with the debug
 *
 * Still throws the error to be handled by the cloud function
 * @param handler
 */
export const onCallWrapper = (handler: onCallFnHandler): onCallFnHandler => {
   return async (data, context) => {
      try {
         return await handler(data, context)
      } catch (e) {
         if (e.name === "AxiosError") {
            logAxiosError(e)
            const errorData = e.toJSON()
            const requestData = `${errorData?.status} - ${errorData?.config?.method} ${errorData?.config?.baseURL}${errorData?.config.url}`
            const error = new Error(
               `Failed to make outbound HTTP request via Axios: ${requestData}`
            )
            error.stack = e.stack
            throw error
         }

         throw e
      }
   }
}

/**
 * Convert business models into plain objects (arrays)
 * @param result
 */
export function serializeModels<T extends BaseModel>(result: T[]) {
   return result.map((entry) => entry.serializeToPlainObject())
}

/**
 * Convert business models into plain objects (arrays)
 * @param result
 */
export function serializePaginatedModels<T extends BaseModel>(
   result: ATSPaginatedResults<T>
): ATSPaginatedResults<object> {
   return {
      ...result,
      results: result?.results?.map((e) => e.serializeToPlainObject()),
   }
}

/**
 * Deterministic Hash the input string
 *
 * Using sha1 because it has fewer collisions' probability than md5
 *  md5 would also work fine here
 *
 * We only care about hashing speed and collisions here, not security
 * @param input
 */
export const sha1 = (input: string) =>
   crypto.createHash("sha1").update(input).digest("hex")

export const compress = (buffer: Buffer): Promise<Buffer> => {
   const deflatePromise = promisify(zlib.deflate)

   return deflatePromise(buffer)
}

export const decompress = (input: Buffer | Uint8Array): Promise<Buffer> => {
   const inflatePromise = promisify(zlib.inflate)
   return inflatePromise(input)
}

/*
 * This function is used to generate a signature for the unsubscribe link
 * */
export const generateSignature = (body: string, secret: string) => {
   return crypto.createHmac("sha256", secret).update(body).digest("hex")
}

export const mapFirestoreAdminSnapshots = <T>(
   snapshots: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
): T[] =>
   snapshots.docs.map((doc) => {
      const data = doc.data()
      const id = doc.id
      return { id, ...data } as T
   })

/**
 * Add parentheses to offset in a date string
 * 1 May 2018 at 14:44 WEST => 1 May 2018 at 14:44 (WEST)
 * November 30, 2022, 11:15 AM GMT => November 30, 2022, 11:15 AM (GMT)
 *
 * This implementation is fragile and doesn't support multiple locales
 * (the format of the date changes)
 *
 * @param dateString
 */
export const dateFormatOffset = (dateString: string) => {
   if (!dateString) return dateString

   const matchingExpressions = [
      /(.*, \d{2}:\d{2} [AP]M) (.+)$/,
      /(.* at \d{2}:\d{2}) (.+)$/,
   ]

   try {
      for (const regex of matchingExpressions) {
         if (regex.test(dateString)) {
            // capture the offset from the date string
            const matches = dateString.match(regex)
            if (matches?.length > 2) {
               return `${matches[1]} (${matches[2]})`
            }
         }
      }
   } catch (e) {
      console.error(e)
   }

   return dateString
}

export const getChangeTypes = (
   change: Change<DocumentSnapshot>
): {
   // Is a new document creation
   isCreate: boolean
   // Is a document update where the document still exists before and after the update
   isUpdate: boolean
   // Is a document deletion
   isDelete: boolean
} => {
   const { before, after } = change
   // check if the document did not exist before but exists now
   const isCreate = !before.exists && after.exists
   // check if the document existed before and still exists now
   const isUpdate = before.exists && after.exists
   // check if the document existed before but does not exist now
   const isDelete = before.exists && !after.exists

   return { isCreate, isUpdate, isDelete }
}

export type FunctionsLogger = typeof functions.logger
