import functions = require("firebase-functions")
import { logAndThrow } from "./lib/validations"
import { number } from "yup"
import { middlewares } from "./middlewares/middlewares"
import { cacheOnCallValues } from "./middlewares/cacheMiddleware"
import { dataValidation, userAuthExists } from "./middlewares/validations"
import { livestreamsRepo, userRepo } from "./api/repositories"
import { UserDataFetcher } from "./lib/recommendation/services/DataFetcherRecommendations"
import UserEventRecommendationService from "./lib/recommendation/UserEventRecommendationService"

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
            const dataFetcher = new UserDataFetcher(
               context.auth.token.email,
               livestreamsRepo,
               userRepo
            )
            const recomendationService =
               await UserEventRecommendationService.create(dataFetcher)

            return await recomendationService.getRecommendations(data.limit)
         } catch (error) {
            logAndThrow("Error in getting recommended events", {
               data,
               error,
            })
         }
      }
   )
)
