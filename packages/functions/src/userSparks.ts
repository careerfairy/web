import functions = require("firebase-functions")
import { SchemaOf, array, mixed, number, object, string } from "yup"

import { sparkRepo, userRepo } from "./api/repositories"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"

import { getCountryOptionByCountryCode } from "@careerfairy/shared-lib/constants/forms"
import {
   GetFeedData,
   Spark,
   sortSeenSparks,
   sortSparksByIds,
} from "@careerfairy/shared-lib/sparks/sparks"
import {
   SparkClientEventsPayload,
   SparkEvent,
   SparkEventActions,
   SparkEventClient,
   SparkSecondWatched,
   SparkSecondWatchedClient,
   SparkSecondsWatchedClientPayload,
} from "@careerfairy/shared-lib/sparks/telemetry"
import { dataValidation, userAuthExists } from "./middlewares/validations"
import { getCountryCode } from "./util"

export const getSparksFeed = functions
   .region(config.region)
   .runWith({
      // Avoid cold starts, but costs ≈ CHF 5-10 per mont
      minInstances: 1,
   })
   .https.onCall(
      middlewares(
         dataValidation({
            userId: string().trim().min(1).optional().nullable(),
            groupId: string().trim().min(1).optional().nullable(),
            creatorId: string().trim().min(1).optional().nullable(),
            numberOfSparks: number().min(1).optional(),
            contentTopicIds: array().of(string()).optional(),
         }),
         async (data: GetFeedData, context) => {
            try {
               const anonymousUserCountryCode = getCountryCode(context)

               const anonymousUserCountry = anonymousUserCountryCode
                  ? getCountryOptionByCountryCode(anonymousUserCountryCode)
                  : undefined

               if ("creatorId" in data && "groupId" in data) {
                  if (data.creatorId && data.groupId) {
                     return {
                        sparks:
                           await sparkRepo.getGroupSparksFeedWithoutCreator(
                              data.groupId as string,
                              data.creatorId,
                              data.numberOfSparks
                           ),
                     }
                  }
               }

               if ("creatorId" in data) {
                  if (data.creatorId) {
                     return {
                        sparks: await sparkRepo.getCreatorSparksFeed(
                           data.creatorId,
                           data.numberOfSparks
                        ),
                        anonymousUserCountryCode,
                     }
                  }
               }

               if ("groupId" in data) {
                  if (data.groupId) {
                     return {
                        sparks: await sparkRepo.getGroupSparksFeed(
                           data.groupId,
                           data.contentTopicIds,
                           data.numberOfSparks
                        ),
                        anonymousUserCountryCode,
                     }
                  }
               }

               if ("userId" in data) {
                  if (data.userId && !data.contentTopicIds?.length) {
                     return {
                        sparks: await sparkRepo.getUserSparksFeed(
                           data.userId,
                           data.numberOfSparks
                        ),
                     }
                  }

                  return {
                     sparks: await sparkRepo.getPublicSparksFeed(
                        data.contentTopicIds,
                        data.numberOfSparks,
                        anonymousUserCountry
                     ),
                     anonymousUserCountryCode,
                  }
               }

               throw new functions.https.HttpsError(
                  "invalid-argument",
                  "No userId or groupId provided"
               )
            } catch (error) {
               functions.logger.error("Error in generating user feed:", error)
               logAndThrow("Error in generating user feed", {
                  data,
                  error,
                  context,
               })
            }
         }
      )
   )

export const markSparkAsSeenByUser = functions
   .region(config.region)
   .https.onCall(
      middlewares(
         dataValidation({
            sparkId: string().required(),
         }),
         userAuthExists(),
         async (
            data: {
               sparkId: string
            },
            context
         ) => {
            try {
               const userEmail = context.auth.token.email
               const sparkId = data.sparkId

               await sparkRepo.markSparkAsSeenByUser(userEmail, sparkId)

               await sparkRepo.removeSparkFromUserFeed(userEmail, sparkId)

               await sparkRepo.replenishUserFeed(userEmail)

               functions.logger.info(
                  `Marked spark ${sparkId} as seen by user ${userEmail}`
               )
            } catch (error) {
               logAndThrow("Error in marking spark as seen by user", {
                  data,
                  error,
                  context,
               })
            }
         }
      )
   )

const sparkEventClientSchema: SchemaOf<SparkClientEventsPayload> =
   object().shape({
      events: array().of(
         object().shape({
            sparkId: string().required(),
            originalSparkId: string().nullable(),
            categoryId: string().nullable(),
            visitorId: string().required(),
            referrer: string().nullable(),
            sessionId: string().required(),
            referralCode: string().nullable(),
            utm_source: string().nullable(),
            utm_medium: string().nullable(),
            utm_campaign: string().nullable(),
            utm_term: string().nullable(),
            utm_content: string().nullable(),
            groupId: string().nullable(),
            actionType: mixed()
               .oneOf(Object.values(SparkEventActions))
               .required(),
            universityCountry: string().nullable(),
            stringTimestamp: string().required(),
            universityName: string().nullable(),
            universityId: string().nullable(),
            fieldOfStudy: string().nullable(),
            levelOfStudy: string().nullable(),
            interactionSource: string().nullable(),
         })
      ),
   })

export const trackSparkEvents = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation(sparkEventClientSchema),
      async (data: SparkClientEventsPayload, context) => {
         try {
            const sparkEvents = data.events.map((sparkEvent) =>
               mapClientPayloadToServerPayload<SparkEventClient, SparkEvent>(
                  sparkEvent,
                  context
               )
            )

            return sparkRepo.trackSparkEvents(sparkEvents)
         } catch (error) {
            logAndThrow("Error in tracking spark event", {
               data,
               error,
               context,
            })
         }
      }
   )
)

const sparkSecondsWatchedClientSchema: SchemaOf<SparkSecondsWatchedClientPayload> =
   object().shape({
      events: array().of(
         object().shape({
            sparkId: string().required(),
            categoryId: string().nullable(),
            visitorId: string().required(),
            videoEventPositionInSeconds: number().required(),
            sessionId: string().required(),
            universityCountry: string().nullable(),
            stringTimestamp: string().required(),
            universityName: string().nullable(),
            universityId: string().nullable(),
            fieldOfStudy: string().nullable(),
            levelOfStudy: string().nullable(),
            interactionSource: string().nullable(),
         })
      ),
   })

export const trackSparkSecondsWatched = functions
   .region(config.region)
   .https.onCall(
      middlewares(
         dataValidation(sparkSecondsWatchedClientSchema),
         async (data: SparkSecondsWatchedClientPayload, context) => {
            try {
               const sparkSecondsWatched = data.events.map((sparkEvent) =>
                  mapClientPayloadToServerPayload<
                     SparkSecondWatchedClient,
                     SparkSecondWatched
                  >(sparkEvent, context)
               )

               return sparkRepo.trackSparkSecondsWatched(sparkSecondsWatched)
            } catch (error) {
               logAndThrow("Error in tracking spark seconds watched", {
                  data,
                  error,
                  context,
               })
            }
         }
      )
   )

export const getUserWatchedSparks = async (
   userEmail: string,
   limit: number
): Promise<Spark[]> => {
   const seenSparks = await userRepo.getUserSeenSparks(userEmail)

   if (!seenSparks) return []

   const sparkIds = sortSeenSparks(seenSparks, limit)

   const sparks = (await sparkRepo.getSparksByIds(sparkIds)) || []

   // Re sort ensuring order stays the same after fetching data
   const sortedSparks = sortSparksByIds(sparkIds, sparks)

   // Leaving const to allow debugging
   return sortedSparks
}

/**
 * Converts a string timestamp to a Date object. If the string is not a valid timestamp, it falls back to the current time.
 * @param {string} stringTimestamp - The string representation of the timestamp.
 * @returns {Date} The converted Date object.
 */
const getValidEventTimestamp = (stringTimestamp: string): Date => {
   let timestamp = new Date(stringTimestamp)
   if (isNaN(timestamp.getTime())) {
      timestamp = new Date() // Fallback to current time
   }
   return timestamp
}

/**
 * Maps client payload to server payload by adding the userId, timestamp, and countryCode fields from the server's callable context.
 * @param clientPayload - The client payload.
 * @param context - The callable context.
 * @returns  The server payload.
 */
const mapClientPayloadToServerPayload = <
   TClientPayload extends {
      stringTimestamp: string
   },
   TServerPayload extends Omit<TClientPayload, "stringTimestamp"> & {
      timestamp: Date
      userId: string
      countryCode: string
   }
>(
   { stringTimestamp, ...rest }: TClientPayload,
   context: functions.https.CallableContext
): TServerPayload => {
   const countryCode = getCountryCode(context)
   const userId = context.auth?.uid ?? null

   return {
      ...rest,
      userId,
      countryCode,
      timestamp: getValidEventTimestamp(stringTimestamp),
   } as TServerPayload
}
