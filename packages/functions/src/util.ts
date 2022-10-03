import { DateTime } from "luxon"
import { customAlphabet } from "nanoid"
import { https } from "firebase-functions"
import { BaseModel } from "@careerfairy/shared-lib/dist/BaseModel"
import { ClientError } from "graphql-request"
import * as crypto from "crypto"
import { promisify } from "util"
import * as zlib from "zlib"
import { LiveStreamEventWithUsersLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"
import { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import {
   Reminder1Hour,
   Reminder24Hours,
   Reminder5Min,
   ReminderData,
} from "./reminders"
import functions = require("firebase-functions")

export const setHeaders = (req, res) => {
   res.set("Access-Control-Allow-Origin", "*")
   res.set("Access-Control-Allow-Credentials", "true")

   if (req.method === "OPTIONS") {
      // Send response to OPTIONS requests
      res.set("Access-Control-Allow-Methods", "GET")
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
      res.set("Access-Control-Max-Age", "3600")
      return res.status(204).send("")
   }
}

export const getStreamLink = (streamId) => {
   return "https://www.careerfairy.io/upcoming-livestream/" + streamId
}

/**
 * Generate a dynamic reminder email using a stream and user registered data
 *
 */
export const generateReminderEmailData = (
   stream: LiveStreamEventWithUsersLivestreamData,
   reminder: ReminderData,
   minutesToRemindBefore: number,
   emailMaxChunkSize: number
): MailgunMessageData[] => {
   const { company, start, registeredUsers, timezone } = stream

   if (!start || !registeredUsers?.length) {
      return []
   }

   const luxonStartDate = DateTime.fromJSDate(start.toDate(), {
      zone: timezone || "Europe/Zurich",
   })

   const formattedDate = luxonStartDate.toLocaleString(DateTime.DATETIME_FULL)

   const dateToDelivery = minutesToRemindBefore
      ? luxonStartDate.minus({ minutes: minutesToRemindBefore }).toRFC2822()
      : 0

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

   const subjectMap = {
      [Reminder5Min.key]: `🔥 NOW: Meet ${company} Live!`,
      [Reminder1Hour.key]: `🔥 Reminder: ${company} in 1 hour!`,
      [Reminder24Hours.key]: `🔥 Reminder: Meet ${company} tomorrow!`,
      fallback: `Reminder: Live Stream with ${company} at ${formattedDate}`,
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

/**
 * Slice Registered Users into chunks
 *
 */
const getRegisteredUsersIntoChunks = (registeredUsers, chunkSize): string[] => {
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
      const formattedDate = luxonStartDate.toLocaleString(
         DateTime.DATETIME_FULL
      )

      const emailData = {
         timeMessage: timeMessage,
         companyName: company,
         userFirstName: firstName,
         streamTitle: title,
         formattedDateTime: formattedDate,
         formattedSpeaker: `${speakerFirstName} ${speakerLastName}, ${speakerPosition}`,
         upcomingStreamLink: externalEventLink
            ? externalEventLink
            : getStreamLink(streamId),
         german: language?.code === "DE",
      }

      return {
         ...acc,
         [studentEmail]: emailData,
      }
   }, {})
}

export const addMinutesDate = (date: Date, minutes: number): Date => {
   return new Date(date.getTime() + minutes * 60000)
}

export const getArrayDifference = (array1, array2) => {
   return array2.filter((element) => {
      return !array1.includes(element)
   })
}

export const makeRequestingGroupIdFirst = (
   arrayOfGroupIds = [],
   requestingGroupId
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

export const studentBelongsToGroup = (student, group) => {
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

export const getRegisteredGroupById = (student, groupId) => {
   return (
      student.registeredGroups &&
      student.registeredGroups.find((category) => category.groupId === groupId)
   )
}

export const stringMatches = (basString, stringsToMatch) => {
   return stringsToMatch.some(
      (stringToMatch) =>
         stringToMatch.toLowerCase().replace(/\s/g, "") ===
         basString.toLowerCase().replace(/\s/g, "")
   )
}

export const getStudentInGroupDataObject = (student, group) => {
   const studentDataObject = {
      "First Name": student.firstName,
      "Last Name": student.lastName,
      Email: student.userEmail,
      University: (student.university && student.university.name) || "N/A",
   }
   const studentCategoriesForGroup = getRegisteredGroupById(
      student,
      group.groupId
   )
   if (
      studentCategoriesForGroup &&
      studentCategoriesForGroup.categories &&
      studentCategoriesForGroup.categories.length &&
      group.categories
   ) {
      group.categories.forEach((category) => {
         const studentCatValue = studentCategoriesForGroup.categories.find(
            (studCat) => studCat.id === category.id
         )
         if (studentCatValue) {
            const studentSelectedOption = category.options.find(
               (option) => option.id === studentCatValue.selectedValueId
            )
            if (studentSelectedOption) {
               studentDataObject[category.name] = studentSelectedOption.name
            }
         }
      })
   }
   return studentDataObject
}

export const groupHasSpecializedCategories = (group) => {
   if (group.categories) {
      const fieldOfStudyCategory = group.categories.find((category) =>
         stringMatches(category.name, ["field of study", "Domaine d'étude"])
      )
      const levelOfStudyCategory = group.categories.find((category) =>
         stringMatches(category.name, ["level of study"])
      )
      return fieldOfStudyCategory && levelOfStudyCategory
   }
   return false
}

export const getSpecializedStudentStats = (
   registeredStudentsFromGroup,
   group
) => {
   const fieldOfStudyCategory = group.categories.find((category) =>
      stringMatches(category.name, ["field of study", "Domaine d'étude"])
   )
   const levelOfStudyCategory = group.categories.find((category) =>
      stringMatches(category.name, ["level of study"])
   )
   const categoryStats = {
      type: "specialized",
      id: fieldOfStudyCategory.id,
      options: {},
      names: levelOfStudyCategory.options.map((option) => option.name),
   }
   fieldOfStudyCategory.options.forEach((option) => {
      const optionObj = {
         name: option.name,
         id: levelOfStudyCategory.id,
         entries: 0,
         subOptions: {},
      }
      levelOfStudyCategory.options.forEach((option2) => {
         optionObj.subOptions[option2.id] = {
            name: option2.name,
            entries: 0,
         }
      })
      categoryStats.options[option.id] = optionObj
   })
   registeredStudentsFromGroup.forEach((student) => {
      const registeredGroup = getRegisteredGroupById(student, group.groupId)
      const targetFieldOfStudyOption =
         registeredGroup &&
         registeredGroup.categories.find(
            (category) => category.id === fieldOfStudyCategory.id
         )
      const fieldOfStudyOptionId =
         targetFieldOfStudyOption && targetFieldOfStudyOption.selectedValueId
      const targetLevelOfStudyOption =
         registeredGroup &&
         registeredGroup.categories.find(
            (category) => category.id === levelOfStudyCategory.id
         )
      const levelOfStudyOptionId =
         targetLevelOfStudyOption && targetLevelOfStudyOption.selectedValueId
      if (
         categoryStats.options[fieldOfStudyOptionId] &&
         categoryStats.options[fieldOfStudyOptionId].subOptions[
            levelOfStudyOptionId
         ]
      ) {
         categoryStats.options[fieldOfStudyOptionId].entries =
            categoryStats.options[fieldOfStudyOptionId].entries + 1
         categoryStats.options[fieldOfStudyOptionId].subOptions[
            levelOfStudyOptionId
         ].entries =
            categoryStats.options[fieldOfStudyOptionId].subOptions[
               levelOfStudyOptionId
            ].entries + 1
      }
   })
   return categoryStats
}

export const getAggregateCategories = (participants, currentGroup) => {
   const categories = []
   if (participants) {
      participants.forEach((user) => {
         const matched =
            user &&
            user.registeredGroups &&
            user.registeredGroups.find(
               (groupData) => groupData.groupId === currentGroup.id
            )
         if (matched) {
            categories.push(matched)
         }
      })
   }
   return categories
}

export const getTypeOfStudents = (participants, currentCategory, group) => {
   const aggregateCategories = getAggregateCategories(participants, group)
   const flattenedGroupOptions = [...currentCategory.options].map((option) => {
      const entries = aggregateCategories.filter((category) =>
         category.categories.some(
            (userOption) => userOption.selectedValueId === option.id
         )
      ).length
      return { ...option, entries }
   })
   return {
      options: flattenedGroupOptions.sort((a, b) => b.entries - a.entries),
      categoryName: currentCategory.name,
      id: currentCategory.groupId,
   }
}
export const getNonSpecializedStats = (groupCategories, students, group) => {
   return {
      type: "non-specialized",
      noneSpecializedStats: groupCategories.map((category) =>
         getTypeOfStudents(students, category, group)
      ),
   }
}

export const getRegisteredStudentsStats = (
   registeredStudentsFromGroup,
   group
) => {
   if (groupHasSpecializedCategories(group)) {
      return getSpecializedStudentStats(registeredStudentsFromGroup, group)
   }
   return getNonSpecializedStats(
      group.categories || [],
      registeredStudentsFromGroup,
      group
   )
}

export const getRatingsAverage = (contentRatings) =>
   contentRatings.reduce((a, b) => {
      return a + b.rating || 0
   }, 0) / contentRatings.length

export const getDateString = (streamData) => {
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
   arrayOfTemplates,
   chunkSize = 500
) => {
   const nestedArrayOfTemplates = []
   let i
   let j
   let tempArray
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
 *
 * @returns {string}
 */
export const isLocalEnvironment = () => {
   return (
      process.env.FIREBASE_AUTH_EMULATOR_HOST ||
      process.env.FIRESTORE_EMULATOR_HOST ||
      process.env.FUNCTIONS_EMULATOR ||
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
   )
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
   ...extraData
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
   ...extraData
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
