import functions = require("firebase-functions")
import { logAndThrow } from "./lib/validations"
import { number } from "yup"
import { userEventRecommendationService } from "./api/services"
import { middlewares } from "./middlewares/middlewares"
import { cacheOnCallValues } from "./middlewares/cacheMiddleware"
import { dataValidation, userAuthExists } from "./middlewares/validations"

/**
 * Get Recommended Events
 * @param data - { limit: number } - limit of events to return
 * @param context - CallableContext
 * @returns {Promise<string[]>} - A list of recommended event Ids in order of relevance
 * */
export const getRecommendedEvents = functions.https.onCall(
   middlewares(
      dataValidation({
         limit: number().default(10).max(30),
      }),
      userAuthExists(),
      cacheOnCallValues(
         "recommendedEvents",
         (data, context) => [context.auth.token.email, data.limit],
         60 // 1m
      ),
      async (data, context) => {
         try {
            return await userEventRecommendationService.getRecommendations(
               context.auth.token.email,
               data.limit
            )
         } catch (error) {
            logAndThrow("Error in getting recommended events", {
               data,
               error,
            })
         }
      }
   )
)
