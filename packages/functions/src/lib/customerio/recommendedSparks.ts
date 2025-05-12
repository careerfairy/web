import { logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import { livestreamsRepo, sparkRepo, userRepo } from "../../api/repositories"
import {
   customerIOWebhookSignatureMiddleware,
   warmingMiddleware,
   withMiddlewares,
} from "../../middlewares-gen2/onRequest"
import { getWebBaseUrl } from "../../util"
import { SparksDataFetcher } from "../recommendation/services/DataFetcherRecommendations"
import SparkRecommendationService from "../recommendation/SparkRecommendationService"

/**
 * Type definition for the request body from Customer.io
 */
type RecommendedSparksRequest = {
   userAuthId: string
}

/**
 * Type definition for the response format
 */
type CustomerIORecommendedSparkWebhookData = {
   id: string
   question: string
   company: string
   category_id: string
   thumbnailUrl: string
   url: string
}

/**
 * Webhook endpoint for Customer.io to get recommended Sparks for a user.
 * This endpoint will be called by Customer.io during their onboarding journey.
 */
export const customerIORecommendedSparksWebhook = onRequest(
   {
      memory: "1GiB",
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
            const { userAuthId } = request.body as RecommendedSparksRequest

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

            const dataFetcher = new SparksDataFetcher(
               user.userEmail,
               livestreamsRepo,
               userRepo,
               sparkRepo
            )

            const recommendationService =
               await SparkRecommendationService.create(dataFetcher)

            const sparkIds = await recommendationService.getRecommendations(3)

            const sparks = await sparkRepo.getSparksByIds(sparkIds)

            const recommendedSparks: CustomerIORecommendedSparkWebhookData[] =
               sparks.map((spark) => ({
                  question: spark.question,
                  company: spark.group.universityName,
                  category_id: spark.category.id,
                  thumbnailUrl: spark.video.thumbnailUrl,
                  url: `${getWebBaseUrl()}/sparks/${spark.id}`,
                  id: spark.id,
               }))

            response.status(200).json({
               sparks: recommendedSparks.slice(0, 3),
            })
         } catch (error) {
            logger.error("Error processing recommended Sparks webhook", error)
            response.status(500).send("Internal Server Error")
         }
      }
   )
)
