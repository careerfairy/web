import { logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import { userRepo } from "../../api/repositories"
import {
   customerIOWebhookSignatureMiddleware,
   warmingMiddleware,
   withMiddlewares,
} from "../../middlewares-gen2/onRequest"

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
}

/**
 * Webhook endpoint for Customer.io to get recommended Jobs for a user.
 * This endpoint will be called by Customer.io during their onboarding journey.
 */
export const customerIORecommendedJobsWebhook = onRequest(
   {
      concurrency: 20,
   },
   withMiddlewares(
      [
         warmingMiddleware,
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

            const recommendedJobs: CustomerIORecommendedJobsWebhookData[] = []

            response.status(200).json({
               jobs: recommendedJobs.slice(0, 3),
            })
         } catch (error) {
            logger.error("Error processing recommended Jobs webhook", error)
            response.status(500).send("Internal Server Error")
         }
      }
   )
)
