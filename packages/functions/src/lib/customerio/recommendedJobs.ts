import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import {
   customJobRepo,
   livestreamsRepo,
   userRepo,
} from "../../api/repositories"
import {
   customerIOWebhookSignatureMiddleware,
   withMiddlewares,
} from "../../middlewares-gen2/onRequest"
import { CustomJobRecommendationService } from "../recommendation/CustomJobRecommendationService"
import { CustomJobDataFetcher } from "../recommendation/services/DataFetcherRecommendations"
import functions = require("firebase-functions")

/**
 * Type definition for the request body from Customer.io
 */
type RecommendedJobsRequest = {
   userAuthId: string
}

/**
 * Type definition for the response format
 */
type CustomerIORecommendedJobsWebhookData = {
   id: string
   url: string
   title: string
   company: string
   jobType: string
   jobLocation: string[]
   jobBusinessFunctionTags: string[]
}

const LIMIT = 3

/**
 * Webhook endpoint for Customer.io to get recommended Jobs for a user.
 * This endpoint will be called by Customer.io.
 */
export const customerIORecommendedJobsWebhook = onRequest(
   withMiddlewares(
      [
         customerIOWebhookSignatureMiddleware(
            process.env.CUSTOMERIO_WEBHOOK_SIGNING_KEY
         ),
      ],
      async (request, response) => {
         if (request.method !== "POST") {
            response.status(405).send("Method Not Allowed")
            return
         }

         try {
            const { userAuthId } = request.body as RecommendedJobsRequest

            if (!userAuthId) {
               logger.error("Missing userAuthId in request body")
               response.status(400).send("Missing userAuthId")
               return
            }

            const user = await userRepo.getUserDataByUid(userAuthId)

            if (!user) {
               logger.error(`User not found with authId: ${userAuthId}`)
               response.status(404).send("User not found")
               return
            }

            if (!user.userEmail) {
               logger.error(`User email not found for authId: ${userAuthId}`)
               response.status(404).send("User email not found")
               return
            }

            const dataFetcher = new CustomJobDataFetcher(
               userAuthId,
               null,
               userRepo,
               customJobRepo,
               livestreamsRepo
            )

            const recommendationService =
               await CustomJobRecommendationService.create(
                  dataFetcher,
                  functions.logger
               )
            const jobIds = await recommendationService.getRecommendations(LIMIT)

            const jobs = await customJobRepo.getCustomJobByIds(jobIds)

            const recommendedJobs: CustomerIORecommendedJobsWebhookData[] =
               jobs.map((job) => ({
                  id: job.id,
                  url: job.postingUrl,
                  title: job.title,
                  company: job.group?.universityName,
                  jobType: job.jobType,
                  jobLocation: job.jobLocation?.map(
                     (location) => location.name
                  ),
                  jobBusinessFunctionTags: job.businessFunctionsTagIds.map(
                     (tagId) => TagValuesLookup[tagId]
                  ),
               }))

            response.status(200).json({
               jobs: recommendedJobs,
            })
         } catch (error) {
            logger.error("Error processing recommended Jobs webhook", error)
            response.status(500).send("Internal Server Error")
         }
      }
   )
)
