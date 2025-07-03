import functions = require("firebase-functions")
import {
   GetRecommendedEventsFnArgs,
   GetRecommendedJobsFnArgs,
} from "@careerfairy/shared-lib/functions/types"
import { onCall } from "firebase-functions/https"
import { boolean, number, string } from "yup"
import {
   customJobRepo,
   groupRepo,
   livestreamsRepo,
   sparkRepo,
   userRepo,
} from "./api/repositories"
import { CustomJobRecommendationService } from "./lib/recommendation/CustomJobRecommendationService"
import UserEventRecommendationService from "./lib/recommendation/UserEventRecommendationService"
import {
   CustomJobDataFetcher,
   UserDataFetcher,
} from "./lib/recommendation/services/DataFetcherRecommendations"
import { logAndThrow } from "./lib/validations"
import { cacheOnCallValues } from "./middlewares/cacheMiddleware"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation, userAuthExists } from "./middlewares/validations"
import { getCountryCode } from "./util"

/**
 * Get Recommended Events
 * @param data - { limit: number, bypassCache?: boolean, referenceLivestreamId?: string } - limit of events to return, optional cache bypass flag, and optional reference livestream ID
 * @param context - CallableContext
 * @returns {Promise<string[]>} - A list of recommended event Ids in order of relevance
 * */
export const getRecommendedEvents = onCall(
   {
      concurrency: 10,
   },
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

export const getRecommendedJobs = onCall(
   {
      concurrency: 10,
   },
   middlewares<GetRecommendedJobsFnArgs>(
      dataValidation({
         userAuthId: string().optional().nullable(),
         limit: number().default(10).max(30),
         bypassCache: boolean().default(false),
         referenceJobId: string().optional().nullable(),
         userCountryCode: string().optional().nullable(),
      }),
      cacheOnCallValues(
         "recommendedJobs",
         (request) => [
            `${request.data.userAuthId || "anonymous"}-${
               request.data.referenceJobId || "no-reference-job"
            }`,
            request.data.limit,
            request.data.referenceJobId,
            request.data.userCountryCode,
         ],
         60 * 60 * 12, // 12 hours
         (request) => request.data.bypassCache === true
      ),
      async (request) => {
         try {
            const countryCode =
               request.data.userCountryCode || getCountryCode(request)
            functions.logger.info("🚀 ~ countryCode:", countryCode)

            const dataFetcher = new CustomJobDataFetcher(
               request.data.userAuthId || null,
               request.data.referenceJobId,
               userRepo,
               customJobRepo,
               livestreamsRepo
            )

            if (countryCode) {
               dataFetcher.setExternalData({
                  countryIsoCode: countryCode,
               })
            }

            const recommendationService =
               await CustomJobRecommendationService.create(
                  dataFetcher,
                  functions.logger
               )

            return await recommendationService.getRecommendations(
               request.data.limit
            )
         } catch (error) {
            functions.logger.error("Error getting recommended jobs:", error)
            logAndThrow("Error getting recommended jobs.", {
               request,
               error,
               userAuthId: request.data.userAuthId || "anonymous",
               referenceJobId: request.data.referenceJobId,
            })
         }
      }
   )
)
