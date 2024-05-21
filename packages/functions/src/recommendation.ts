import functions = require("firebase-functions")
import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { ImplicitLivestreamRecommendationData } from "@careerfairy/shared-lib/recommendation/livestreams/ImplicitLivestreamRecommendationData"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SchemaOf, number, object } from "yup"
import { livestreamsRepo, sparkRepo, userRepo } from "./api/repositories"
import config from "./config"
import UserEventRecommendationService from "./lib/recommendation/UserEventRecommendationService"
import { UserDataFetcher } from "./lib/recommendation/services/DataFetcherRecommendations"
import { logAndThrow } from "./lib/validations"
import { cacheOnCallValues } from "./middlewares/cacheMiddleware"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation, userAuthExists } from "./middlewares/validations"
import { getUserWatchedSparks } from "./sparks"

type GetUserImplicitDataSchema = {
   watchedEventsLimit: number
   watchedSparksLimit: number
   appliedJobsLimit: number
}

const getUserImplicitDataSchema: SchemaOf<GetUserImplicitDataSchema> =
   object().shape({
      watchedEventsLimit: number().default(10),
      watchedSparksLimit: number().default(20),
      appliedJobsLimit: number().default(10),
   })

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
               logAndThrow("Error in getting recommended events", {
                  data,
                  error,
               })
            }
         }
      )
   )

export const getUserImplicitData = functions
   .region(config.region)
   .runWith({ memory: "512MB" })
   .https.onCall(
      middlewares(
         dataValidation(getUserImplicitDataSchema),

         userAuthExists(),
         async (
            data: GetUserImplicitDataSchema,
            context
         ): Promise<ImplicitLivestreamRecommendationData> => {
            console.log("🚀 ~ GetUserImplicitDataSchema -> data:", data)

            try {
               const promises = [
                  livestreamsRepo.getUserInteractedLivestreams(
                     context.auth.token.email,
                     data.watchedEventsLimit
                  ),
                  getUserWatchedSparks(
                     context.auth?.token?.email,
                     data.watchedSparksLimit
                  ),
                  userRepo.getCustomJobApplications(
                     context.auth?.token?.email,
                     data.appliedJobsLimit
                  ),
               ]

               const [interactedEvents, watchedSparks, appliedJobs] =
                  await Promise.all(promises)

               return {
                  watchedLivestreams:
                     interactedEvents as unknown as LivestreamEvent[],
                  watchedSparks: (watchedSparks as unknown as Spark[]) || [],
                  appliedJobs:
                     (appliedJobs as unknown as CustomJobApplicant[]) || [],
               }
            } catch (error) {
               logAndThrow(
                  "Error in getting user implicit data for recommendation",
                  {
                     data,
                     error,
                  }
               )
            }
         }
      )
   )
