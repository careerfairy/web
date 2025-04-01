import functions = require("firebase-functions")
import { SchemaOf, array, mixed, number, object, string } from "yup"

import { sparkRepo, userRepo } from "./api/repositories"
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
import { CallableRequest, onCall } from "firebase-functions/https"
import { dataValidation, userAuthExists } from "./middlewares/validations"
import { getCountryCode } from "./util"

export const getSparksFeed = onCall(
   {
      minInstances: 1,
   },
   middlewares<GetFeedData>(
      dataValidation({
         userId: string().trim().min(1).optional().nullable(),
         groupId: string().trim().min(1).optional().nullable(),
         creatorId: string().trim().min(1).optional().nullable(),
         numberOfSparks: number().min(1).optional(),
         contentTopicIds: array().of(string()).optional(),
      }),
      async (request) => {
         try {
            const anonymousUserCountryCode = getCountryCode(request)

            const anonymousUserCountry = getCountryOptionByCountryCode(
               anonymousUserCountryCode
            )

            if ("creatorId" in request.data && "groupId" in request.data) {
               if (request.data.creatorId && request.data.groupId) {
                  return {
                     sparks: await sparkRepo.getGroupSparksFeedWithoutCreator(
                        request.data.groupId as string,
                        request.data.creatorId,
                        request.data.numberOfSparks
                     ),
                  }
               }
            }

            if ("creatorId" in request.data) {
               if (request.data.creatorId) {
                  return {
                     sparks: await sparkRepo.getCreatorSparksFeed(
                        request.data.creatorId,
                        request.data.numberOfSparks
                     ),
                     anonymousUserCountryCode,
                  }
               }
            }

            if ("groupId" in request.data) {
               if (request.data.groupId) {
                  return {
                     sparks: await sparkRepo.getGroupSparksFeed(
                        request.data.groupId,
                        request.data.contentTopicIds,
                        request.data.numberOfSparks
                     ),
                     anonymousUserCountryCode,
                  }
               }
            }

            if ("userId" in request.data) {
               if (
                  request.data.userId &&
                  !request.data.contentTopicIds?.length
               ) {
                  return {
                     sparks: await sparkRepo.getUserSparksFeed(
                        request.data.userId,
                        request.data.numberOfSparks
                     ),
                  }
               }

               return {
                  sparks: await sparkRepo.getPublicSparksFeed(
                     request.data.contentTopicIds,
                     request.data.numberOfSparks,
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
               error,
               request,
            })
         }
      }
   )
)

export const markSparkAsSeenByUser = onCall(
   middlewares<{ sparkId: string }>(
      dataValidation({
         sparkId: string().required(),
      }),
      userAuthExists(),
      async (request) => {
         try {
            const userEmail = request.auth.token.email
            const sparkId = request.data.sparkId

            await sparkRepo.markSparkAsSeenByUser(userEmail, sparkId)

            await sparkRepo.removeSparkFromUserFeed(userEmail, sparkId)

            await sparkRepo.replenishUserFeed(userEmail)

            functions.logger.info(
               `Marked spark ${sparkId} as seen by user ${userEmail}`
            )
         } catch (error) {
            logAndThrow("Error in marking spark as seen by user", {
               error,
               request,
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

export const trackSparkEvents = onCall(
   middlewares<SparkClientEventsPayload>(
      dataValidation(sparkEventClientSchema),
      async (request) => {
         try {
            const sparkEvents = request.data.events.map((sparkEvent) =>
               mapClientPayloadToServerPayload<SparkEventClient, SparkEvent>(
                  sparkEvent,
                  request
               )
            )

            return sparkRepo.trackSparkEvents(sparkEvents)
         } catch (error) {
            logAndThrow("Error in tracking spark event", {
               error,
               request,
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

export const trackSparkSecondsWatched = onCall(
   middlewares<SparkSecondsWatchedClientPayload>(
      dataValidation(sparkSecondsWatchedClientSchema),
      async (request) => {
         try {
            const sparkSecondsWatched = request.data.events.map((sparkEvent) =>
               mapClientPayloadToServerPayload<
                  SparkSecondWatchedClient,
                  SparkSecondWatched
               >(sparkEvent, request)
            )

            return sparkRepo.trackSparkSecondsWatched(sparkSecondsWatched)
         } catch (error) {
            logAndThrow("Error in tracking spark seconds watched", {
               error,
               request,
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
 * @param request - The callable context.
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
   request: CallableRequest
): TServerPayload => {
   const countryCode = getCountryCode(request)
   const userId = request.auth?.uid ?? null

   return {
      ...rest,
      userId,
      countryCode,
      timestamp: getValidEventTimestamp(stringTimestamp),
   } as TServerPayload
}
