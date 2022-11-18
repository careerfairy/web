import functions = require("firebase-functions")
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
} from "./lib/validations"
import { number, object } from "yup"
import { recommendationEngine } from "./lib/recommendationEngine"

/**
 * Get Recommended Events
 * @param data - { limit: number } - limit of events to return
 * @param context - CallableContext
 * @returns {Promise<string[]>} - A list of recommended event Ids in order of relevance
 * */
export const getRecommendedEvents = functions.https.onCall(
   async (data, context) => {
      try {
         const { email } = await validateUserAuthExists(context)
         const { limit } = await validateData(
            data,
            object({
               limit: number().default(10),
            })
         )

         const recommendedEventsIds = await recommendationEngine(email, limit)

         functions.logger.info(
            `Recommended event IDs for user ${email}: ${recommendedEventsIds}`
         )

         return recommendedEventsIds
      } catch (error) {
         logAndThrow("Error in getting recommended events", {
            data,
            error,
         })
      }
   }
)
