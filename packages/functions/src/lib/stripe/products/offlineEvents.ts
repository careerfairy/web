import {
   OfflineEventFetchStripeCustomerSession,
   OfflineEventSessionMetadata,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import { groupRepo, stripeRepo } from "../../../api/repositories"
import { notifyOfflineEventPurchased } from "../../../api/slack"
import config from "../../../config"
import functions = require("firebase-functions")

export async function handleOfflineEventSession(
   customerId: string,
   returnUrl: string,
   data: OfflineEventFetchStripeCustomerSession
): Promise<Stripe.Checkout.Session> {
   const metadata: OfflineEventSessionMetadata = {
      groupId: data.groupId,
      userEmail: data.customerEmail,
      type: StripeProductType.OFFLINE_EVENT,
   }

   return stripeRepo.createCheckoutSession({
      customerId,
      returnUrl,
      priceId: data.priceId,
      adjustableQuantity: true,
      metadata,
   })
}

export async function handleOfflineEventCheckoutSessionCompleted(
   event: Stripe.CheckoutSessionCompletedEvent
): Promise<void> {
   try {
      const sessionId = event.data.object.id

      // For a session completed event, there must always be a quantity, at least 1.
      const totalQuantityBought =
         await stripeRepo.getTotalQuantityFromCheckoutSessionById(sessionId)

      const metadata = event.data.object
         .metadata as unknown as OfflineEventSessionMetadata

      await Promise.all([
         groupRepo.increaseAvailableOfflineEvents(
            metadata.groupId,
            totalQuantityBought
         ),
         // Get the group information for the Slack notification
         groupRepo.getGroupById(metadata.groupId).then((group) => {
            return notifyOfflineEventPurchased(
               config.slackWebhooks.offlineEventPurchased,
               {
                  groupName: group.universityName ?? metadata.groupId,
                  groupLogoUrl: group.logoUrl,
                  groupId: metadata.groupId,
                  quantityPurchased: totalQuantityBought,
                  customerEmail: metadata.userEmail,
               }
            ).catch((slackError) => {
               functions.logger.error(
                  "❌ Error sending Slack notification for offline event purchase:",
                  slackError
               )
            })
         }),
      ])

      functions.logger.info(
         `📦 Added ${totalQuantityBought} (bought) offline events to group ${metadata.groupId}`
      )
   } catch (error) {
      functions.logger.error(
         "❌ Error handling Stripe Offline Event checkout 'checkout.session.completed' event:",
         error
      )
      throw error
   }
}
