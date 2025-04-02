import {
   CustomerIOUserData,
   CUTOFF_DATE,
   transformUserDataForCustomerIO,
} from "@careerfairy/shared-lib/customerio"
import { UserData } from "@careerfairy/shared-lib/users"
import { logger } from "firebase-functions/v2"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { userRepo } from "../../api/repositories"
import {
   customerIOWebhookSignatureMiddleware,
   withMiddlewares,
} from "../../middlewares-gen2/onRequest"
import { isLocalEnvironment } from "../../util"
import { trackingClient } from "./client"
import { CustomerIOWebhookEvent } from "./types"

/**
 * Set to false when running backfill
 */
const CHECK_FOR_CHANGES = true

export const syncUserToCustomerIO = onDocumentWritten(
   {
      document: "userData/{userId}",
      maxInstances: 70, // CustomerIO has a fair-use rate limit of 100 requests/second
      concurrency: 1, // Process updates sequentially to avoid rate limit issues
   },
   async (event) => {
      if (isLocalEnvironment()) {
         logger.info(
            "Skipping CustomerIO sync in local environment, remove this check if you want to sync to CustomerIO dev workspace"
         )
         return
      }

      const after = event.data?.after?.data() as UserData
      const before = event.data?.before?.data() as UserData

      const authId = after?.authId || before?.authId

      // Document was deleted
      if (!after) {
         try {
            await trackingClient.destroy(authId)
            logger.info(`Removed user ${authId} from CustomerIO`)
         } catch (error) {
            logger.error(
               `Failed to remove deleted user ${authId} from CustomerIO`,
               error
            )
         }
         return
      }

      if (shouldSyncUser(after)) {
         const oldData = before ? transformUserDataForCustomerIO(before) : null
         const newData = transformUserDataForCustomerIO(after)

         // Only sync if data has actually changed
         if (CHECK_FOR_CHANGES && !hasCustomerIODataChanged(oldData, newData)) {
            logger.info(
               `No changes detected for user ${authId}, skipping sync to CustomerIO`
            )
            return
         }

         try {
            await trackingClient.identify(authId, newData)
            logger.info(`Synced user ${authId} to CustomerIO`)
         } catch (error) {
            logger.error(`Failed to sync user ${authId} to CustomerIO`, error)
         }
      } else {
         // User is not active, remove from CustomerIO

         try {
            // Always attempt to remove from CustomerIO if they should be excluded
            // This ensures cleanup of any historical data
            await trackingClient.destroy(authId)
            logger.info(
               `Removed user ${authId} from CustomerIO - Reason: ${getReasonForExclusion(
                  after
               )}`
            )
         } catch (error) {
            // If user doesn't exist in CustomerIO, this will error but that's ok
            if (error?.response?.status !== 404) {
               logger.error(
                  `Failed to remove user ${authId} from CustomerIO`,
                  error
               )
            }
         }
         return
      }
   }
)

const shouldSyncUser = (user: UserData) => {
   return (
      user.lastActivityAt && // User has an activity date
      user.lastActivityAt.toDate() >= CUTOFF_DATE && // User is active since before Sept 2023
      user.emailVerified
   )
}

const getReasonForExclusion = (user: UserData) => {
   if (!user.lastActivityAt) {
      return "no activity date"
   }

   const lastActivityDate = user.lastActivityAt.toDate()
   if (lastActivityDate < CUTOFF_DATE) {
      return `inactive since before ${CUTOFF_DATE.toLocaleDateString()} (last activity: ${lastActivityDate.toLocaleDateString()})`
   }

   return "unknown"
}

/**
 * Checks if CustomerIO data has changed between versions using deep comparison
 */
const hasCustomerIODataChanged = (
   oldData: CustomerIOUserData | null,
   newData: CustomerIOUserData
): boolean => {
   if (!oldData) return true
   return JSON.stringify(oldData) !== JSON.stringify(newData)
}

/**
 * Handles Customer.io webhook events for unsubscribes, subscribes. To add other events, go to:
 * https://fly.customer.io/workspaces/175425/journeys/integrations/reporting-webhooks
 */
export const customerIOWebhook = onRequest(
   withMiddlewares(
      [
         customerIOWebhookSignatureMiddleware(
            process.env.CUSTOMERIO_REPORTING_SIGNING_KEY
         ),
      ],
      async (request, response) => {
         if (request.method !== "POST") {
            response.status(405).send("Method Not Allowed")
            return
         }

         const event = request.body as CustomerIOWebhookEvent

         try {
            switch (event.metric) {
               case "subscribed":
               case "unsubscribed": {
                  const userEmail = event.data.identifiers.email
                  logger.info(
                     `Updating subscription status for user ${userEmail} to ${event.metric}`
                  )
                  try {
                     await userRepo.updateUserData(userEmail, {
                        unsubscribed: event.metric === "unsubscribed",
                     })
                     logger.info(
                        `Updated subscription status for user ${userEmail} to ${event.metric}`
                     )
                  } catch (error) {
                     logger.warn(
                        `Failed to update subscription status for user ${userEmail}`,
                        error
                     )
                  }
                  response.status(200).send("OK")
                  break
               }
               default: {
                  // Acknowledge other events but don't process them
                  logger.info(`Received unhandled event type: ${event.metric}`)
                  response.status(200).send("OK")
               }
            }
         } catch (error) {
            logger.error(
               `Error processing ${event.metric} webhook for user ${event.data?.identifiers?.email}`,
               event,
               error
            )
            response.status(500).send("Internal Server Error")
         }
      }
   )
)
