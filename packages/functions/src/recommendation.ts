import functions = require("firebase-functions")
import { GetRecommendedEventsFnArgs } from "@careerfairy/shared-lib/functions/types"
import { onCall } from "firebase-functions/https"
import { boolean, number, string } from "yup"
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
 * @param data - { limit: number, bypassCache?: boolean, referenceLivestreamId?: string } - limit of events to return, optional cache bypass flag, and optional reference livestream ID
 * @param context - CallableContext
 * @returns {Promise<string[]>} - A list of recommended event Ids in order of relevance
 * */
export const getRecommendedEvents = onCall(
   middlewares<GetRecommendedEventsFnArgs>(
      dataValidation({
         limit: number().default(10).max(30),
         bypassCache: boolean().default(false),
         referenceLivestreamId: string().optional().nullable(),
      }),
      userAuthExists(),
      cacheOnCallValues(
         "recommendedEvents",
         (request) => [
            request.auth.token.email,
            request.data.limit,
            request.data.referenceLivestreamId,
         ],
         60, // 1m
         (request) => request.data.bypassCache === true
      ),
      async (request) => {
         try {
            const dataFetcher = new UserDataFetcher(
               request.auth.token.email,
               livestreamsRepo,
               userRepo,
               sparkRepo,
               groupRepo,
               { referenceLivestreamId: request.data.referenceLivestreamId }
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
