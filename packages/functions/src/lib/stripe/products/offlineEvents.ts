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
export async function handleOfflineEventWebhook(
   event: Stripe.CheckoutSessionCompletedEvent
): Promise<void> {
   try {
      const sessionId = event.data.object.id

      // Retrieve the full checkout session with expanded line_items to get quantity information
      const session = await stripeRepo.stripe.checkout.sessions.retrieve(
         sessionId,
         {
            expand: ["line_items"],
         }
      )

      // Extract quantity information from line items
      const totalQuantity =
         stripeRepo.getTotalQuantityFromCheckoutSession(session)

      functions.logger.info(
         `📦 Total items purchased: ${totalQuantity}`,
         JSON.stringify(session.line_items?.data)
      )

      // TODO: Implement specific logic for offline events based on quantity
      // This might include:
      // - Updating event attendance records with the correct quantity
      // - Sending confirmation emails with quantity information
      // - Creating multiple tickets/registrations based on quantity
      // - Updating inventory or capacity tracking
   } catch (error) {
      functions.logger.error("❌ Error handling offline event webhook:", error)
      throw error
   }
}
