import functions = require("firebase-functions")
import { string, number } from "yup"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { sparkRepo } from "./api/repositories"

import { dataValidation, userAuthExists } from "./middlewares/validations"
import { GetFeedData } from "@careerfairy/shared-lib/sparks/sparks"
import {
   SparkEvent,
   SparkEventActions,
   SparkEventClient,
} from "@careerfairy/shared-lib/sparks/analytics"
import { bigQueryClient } from "./api/bigQuery"

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

const sparkEventClientSchema = {
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
   actionType: string().oneOf(Object.values(SparkEventActions)).required(),
   universityCountry: string().nullable(),
}

const cacheForTesting: SparkEvent[] = []

export const trackSparkEvent = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation(sparkEventClientSchema),
      userAuthExists(),
      async (data: SparkEventClient, context) => {
         try {
            /**
             * The "x-appengine-(country/city/region)" header is added by Google App Engine when the function is deployed.
             * It uses the request's IP address to determine the country. This header is not present during local development
             * because the function is not running on Google's servers.
             */
            const countryCode = context?.rawRequest?.headers[
               "x-appengine-country"
            ]
               ? context.rawRequest.headers["x-appengine-country"].toString()
               : null
            const userId = context.auth?.uid ?? null

            // Create a complete SparkEvent object
            const sparkEvent: SparkEvent = {
               ...data,
               userId,
               timestamp: new Date(),
               countryCode, // Replace with actual country code
            }

            cacheForTesting.push(sparkEvent)

            functions.logger.info("sparkEvent", sparkEvent)
            functions.logger.info("cacheForTesting", cacheForTesting)

            // Insert the spark event into BigQuery
            const datasetId = "SparkAnalytics" // Replace with your BigQuery dataset ID
            const tableId = "SparkEvents" // Replace with your BigQuery table ID

            const rows = [sparkEvent]

            // Insert data into a table
            await bigQueryClient.dataset(datasetId).table(tableId).insert(rows)

            console.log(`Inserted ${rows.length} rows`)
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
