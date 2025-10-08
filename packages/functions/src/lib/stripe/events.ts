import { StripeProductType } from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import { handleGroupPlanCheckoutSessionCompleted } from "./products/groupPlans"
import { handleOfflineEventCheckoutSessionCompleted } from "./products/offlineEvents"
import functions = require("firebase-functions")

/**
 * Map of product types to their checkout.session.completed handlers.
 */
export const checkoutSessionCompletedHandlers = {
   [StripeProductType.GROUP_PLAN]: handleGroupPlanCheckoutSessionCompleted,
   [StripeProductType.OFFLINE_EVENT]:
      handleOfflineEventCheckoutSessionCompleted,
}

export const EventHandlers: Partial<
   Record<Stripe.Event.Type, (event: Stripe.Event) => Promise<void>>
> = {
   "checkout.session.completed": handleCheckoutSessionCompleted,
}

// Additional handlers can be added here for other events, e.g. checkout.session.expired, checkout.session.async_payment_succeeded, etc.

export async function handleCheckoutSessionCompleted(
   event: Stripe.CheckoutSessionCompletedEvent
): Promise<void> {
   const metadata = event?.data?.object?.metadata

   if (metadata && metadata.groupId && metadata.type) {
      const handler =
         checkoutSessionCompletedHandlers[metadata.type as StripeProductType]

      if (handler) {
         await handler(event)
      } else {
         functions.logger.error(
            "Could not process Stripe event checkout.session.completed - unknown type: ",
            metadata
         )
      }
   } else {
      functions.logger.error(
         "Could not process Stripe event checkout.session.completed based on metadata: ",
         metadata
      )
   }
}
