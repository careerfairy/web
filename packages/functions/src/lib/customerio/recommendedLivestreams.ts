import { logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import {
   groupRepo,
   livestreamsRepo,
   sparkRepo,
   userRepo,
} from "../../api/repositories"
import { formatLivestreamDate, getWebBaseUrl } from "../../util"
import { UserDataFetcher } from "../recommendation/services/DataFetcherRecommendations"
import UserEventRecommendationService from "../recommendation/UserEventRecommendationService"
import { CustomerIORecommendedLivestreamWebhookData } from "./types"
import { validateCustomerIOWebhookSignature } from "./utils"

/**
 * Type definition for the request body from Customer.io
 */
interface RecommendedLivestreamsRequest {
   userAuthId: string
}

/**
 * Webhook endpoint for Customer.io to get recommended livestreams for a user.
 * This endpoint will be called by Customer.io during their onboarding journey.
 */
export const customerIORecommendedLivestreamsWebhook = onRequest(
   async (request, response) => {
      // Only accept POST requests
      if (request.method !== "POST") {
         response.status(405).send("Method Not Allowed")
         return
      }

      // Verify webhook signature
      const isSignatureValid = validateCustomerIOWebhookSignature(
         request,
         process.env.CUSTOMERIO_WEBHOOK_SIGNING_KEY
      )

      if (!isSignatureValid) {
         logger.error(
            "CustomerIO: Invalid webhook signature for recommended livestreams"
         )
         response.status(401).send("Unauthorized")
         return
      }

      try {
         const { userAuthId } = request.body as RecommendedLivestreamsRequest

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

         const dataFetcher = new UserDataFetcher(
            user.userEmail,
            livestreamsRepo,
            userRepo,
            sparkRepo,
            groupRepo
         )

         const recommendationService =
            await UserEventRecommendationService.create(dataFetcher)

         const eventIds = await recommendationService.getRecommendations(3)

         const livestreams = await livestreamsRepo.getLivestreamsByIds(eventIds)

         const recommendedLivestreams: CustomerIORecommendedLivestreamWebhookData[] =
            livestreams.map((livestream) => ({
               title: livestream.title,
               backgroundImageUrl: livestream.backgroundImageUrl,
               url: `${getWebBaseUrl()}/portal/livestream/${livestream.id}`,
               company: livestream.company,
               start: formatLivestreamDate(
                  livestream.start.toDate(),
                  user.timezone || "Europe/Zurich"
               ),
            }))

         response.status(200).json(recommendedLivestreams.slice(0, 3))
      } catch (error) {
         logger.error("Error processing recommended livestreams webhook", error)
         response.status(500).send("Internal Server Error")
      }
   }
)
