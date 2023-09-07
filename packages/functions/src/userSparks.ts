import functions = require("firebase-functions")
import { string, number, object, SchemaOf, mixed, array } from "yup"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { sparkRepo } from "./api/repositories"

import { dataValidation, userAuthExists } from "./middlewares/validations"
import { GetFeedData } from "@careerfairy/shared-lib/sparks/sparks"
import {
   SparkEvent,
   SparkEventActions,
   SparkClientEventsPayload,
} from "@careerfairy/shared-lib/sparks/analytics"

export const getSparksFeed = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation({
         userId: string().trim().min(1).optional().nullable(),
         groupId: string().trim().min(1).optional(),
         numberOfSparks: number().min(1).optional(),
      }),
      async (data: GetFeedData, context) => {
         try {
            if ("userId" in data) {
               if (data.userId) {
                  return sparkRepo.getUserSparksFeed(
                     data.userId,
                     data.numberOfSparks
                  )
               } else {
                  return sparkRepo.getPublicSparksFeed(data.numberOfSparks)
               }
            }

            if ("groupId" in data) {
               return sparkRepo.getGroupSparksFeed(
                  data.groupId,
                  data.numberOfSparks
               )
            }

            throw new functions.https.HttpsError(
               "invalid-argument",
               "No userId or groupId provided"
            )
         } catch (error) {
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
      sparkEvents: array().of(
         object().shape({
            sparkId: string().required(),
            originalSparkId: string().nullable(),
            visitorId: string().required(),
            referrer: string().nullable(),
            sessionId: string().required(),
            referralCode: string().nullable(),
            utm_source: string().nullable(),
            utm_medium: string().nullable(),
            utm_campaign: string().nullable(),
            utm_term: string().nullable(),
            utm_content: string().nullable(),
            actionType: mixed()
               .oneOf(Object.values(SparkEventActions))
               .required(),
            universityCountry: string().nullable(),
            stringTimestamp: string().required(),
         })
      ),
   })

export const trackSparkEvent = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation(sparkEventClientSchema),
      userAuthExists(),
      async (data: SparkClientEventsPayload, context) => {
         try {
            /**
             * The "x-appengine-(country/city/region)" header is added by Google App Engine when the function is deployed.
             * It uses the request's IP address to determine the country. This header is not present during local development
             * because the function is not running on Google's servers.
             */
            const appEngineCountry =
               context?.rawRequest?.headers["x-appengine-country"]

            const countryCode = appEngineCountry
               ? appEngineCountry.toString()
               : null

            const userId = context.auth?.uid ?? null

            // Convert the SparkEventClient[] to SparkEvent[]
            const sparkEvents: SparkEvent[] = data.sparkEvents.map(
               ({ stringTimestamp, ...sparkClientEvent }) => {
                  const timestamp = getValidEventTimestamp(stringTimestamp)
                  return {
                     ...sparkClientEvent,
                     userId,
                     timestamp,
                     countryCode,
                  }
               }
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
