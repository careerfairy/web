import functions = require("firebase-functions")
import { number } from "yup"
import { livestreamsRepo, sparkRepo, userRepo } from "./api/repositories"
import config from "./config"
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
export const getRecommendedEvents = functions
   .region(config.region)
   .https.onCall(
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
                  userRepo,
                  sparkRepo
               )

               const recommendationService =
                  await UserEventRecommendationService.create(dataFetcher)

               return await recommendationService.getRecommendations(data.limit)
            } catch (error) {
               functions.logger.error(
                  "Error in getting recommended events:",
                  error
               )
               logAndThrow("Error in getting recommended events", {
                  data,
                  error,
               })
            }
         }
      )
   )
