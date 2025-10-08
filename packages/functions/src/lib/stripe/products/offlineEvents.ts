import {
   OfflineEventFetchStripeCustomerSession,
   OfflineEventSessionMetadata,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import { stripeRepo } from "../../../api/repositories"
import functions = require("firebase-functions")

/**
 * Handles offline event session creation with full logic
 */
export async function handleOfflineEventSession(
   customerId: string,
   returnUrl: string,
   data: OfflineEventFetchStripeCustomerSession,
   sessionMetadataVersion: string
): Promise<Stripe.Checkout.Session> {
   const metadata: OfflineEventSessionMetadata = {
      groupId: data.groupId,
      userEmail: data.customerEmail,
      version: sessionMetadataVersion,
      type: StripeProductType.OFFLINE_EVENT,
   }

   return stripeRepo.createCheckoutSession({
      customerId,
      returnUrl,
      priceId: data.priceId,
      metadata,
   })
}

/**
 * Handles offline event webhook events
 * Retrieves the purchased quantity from the checkout session
 */
export async function handleOfflineEventCheckoutSessionCompleted(
   event: Stripe.CheckoutSessionCompletedEvent
): Promise<void> {
   try {
      const sessionId = event.data.object.id

      const totalQuantity =
         await stripeRepo.getTotalQuantityFromCheckoutSessionById(sessionId)

      functions.logger.info(`📦 Total items purchased: ${totalQuantity}`)

      // TODO: Implement specific logic for offline events based on quantity
   } catch (error) {
      functions.logger.error(
         "❌ Error handling Stripe Offline Event webhook:",
         error
      )
      throw error
   }
}
