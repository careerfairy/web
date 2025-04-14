import functions = require("firebase-functions")
import { onCall } from "firebase-functions/https"
import { number } from "yup"
import {
   groupRepo,
   livestreamsRepo,
   sparkRepo,
   userRepo,
} from "./api/repositories"
import UserEventRecommendationService from "./lib/recommendation/UserEventRecommendationService"
import { UserDataFetcher } from "./lib/recommendation/services/DataFetcherRecommendations"
import { logAndThrow } from "./lib/validations"
import { cacheOnCallValues } from "./middlewares/cacheMiddleware"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation, userAuthExists } from "./middlewares/validations"

/**
 * Get Recommended Events
 * @param data - { limit: number } - limit of events to return
 * @param context - CallableContext
 * @returns {Promise<string[]>} - A list of recommended event Ids in order of relevance
 * */
export const getRecommendedEvents = onCall(
   middlewares<{ limit: number }>(
      dataValidation({
         limit: number().default(10).max(30),
      }),
      userAuthExists(),
      cacheOnCallValues(
         "recommendedEvents",
         (request) => [request.auth.token.email, request.data.limit],
         60 // 1m
      ),
      async (request) => {
         try {
            const dataFetcher = new UserDataFetcher(
               request.auth.token.email,
               livestreamsRepo,
               userRepo,
               sparkRepo,
               groupRepo
            )

            const recommendationService =
               await UserEventRecommendationService.create(dataFetcher)

            return await recommendationService.getRecommendations(
               request.data.limit
            )
         } catch (error) {
            functions.logger.error(
               "Error in getting recommended events:",
               error
            )
            logAndThrow("Error in getting recommended events", {
               request,
               error,
            })
         }
      }
   )
)
