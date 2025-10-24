import { Group } from "@careerfairy/shared-lib/groups"
import {
   OfflineEventFetchStripeCustomerSession,
   OfflineEventSessionMetadata,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import { groupRepo } from "../../../api/repositories"
import {
   notifyOfflineEventIncreaseFailed,
   notifyOfflineEventPurchased,
} from "../../../api/slack"
import config from "../../../config"
import { logAndThrow } from "../../../lib/validations"
import { IStripeFunctionsRepository } from "../index"
import functions = require("firebase-functions")

export async function handleOfflineEventSession(
   customerId: string,
   returnUrl: string,
   data: OfflineEventFetchStripeCustomerSession,
   stripeRepo: IStripeFunctionsRepository
): Promise<Stripe.Checkout.Session> {
   const metadata: OfflineEventSessionMetadata = {
      groupId: data.groupId,
      userEmail: data.customerEmail,
      userName: data.customerName,
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
   event: Stripe.CheckoutSessionCompletedEvent,
   stripeRepo: IStripeFunctionsRepository
): Promise<void> {
   // Being defensive about the event object (but should never happen), but if it does
   // it will crash in the try/catch block and notifity Slack of the error.
   const sessionId = event?.data?.object?.id
   // Being defensive about the metadata object (but should never happen) as this is called
   // after checking the metadata type and that it also contains the groupId
   const metadata = event?.data?.object
      ?.metadata as unknown as OfflineEventSessionMetadata

   let totalQuantityBought: number
   let group: Group

   try {
      /**
       * If any of these operations fail, a Slack notification must be, as
       * the group will not have the correct number of available offline events when any of
       * these operations fail.
       */

      totalQuantityBought =
         await stripeRepo.getTotalQuantityFromCheckoutSessionById(sessionId)

      group = await groupRepo.getGroupById(metadata.groupId)

      await groupRepo.increaseAvailableOfflineEvents(
         metadata.groupId,
         totalQuantityBought
      )

      functions.logger.info(
         `📦 Added ${totalQuantityBought} (bought) offline events to group ${metadata.groupId}`
      )

      await notifyOfflineEventPurchased(
         config.slackWebhooks.offlineEventPurchased,
         {
            groupName: group.universityName,
            groupLogoUrl: group.logoUrl,
            groupId: metadata.groupId,
            quantityPurchased: totalQuantityBought,
            previousCredits: group.availableOfflineEvents,
            updatedCredits:
               (group.availableOfflineEvents || 0) + totalQuantityBought,
            customerEmail: metadata.userEmail,
            customerName: metadata.userName,
         }
      )

      functions.logger.info(
         `✅ Successfully processed offline event checkout session completed event for Customer: ${metadata.groupId}, Quantity: ${totalQuantityBought}`
      )
   } catch (error) {
      await notifyOfflineEventIncreaseFailed(
         config.slackWebhooks.offlineEventIncreaseFailed,
         {
            groupName: group?.universityName || "Could not determine group",
            groupLogoUrl: group?.logoUrl || "unknown-group-logo-url",
            groupId: metadata?.groupId || "unknown-group-id",
            currentCredits: `${
               group?.availableOfflineEvents !== undefined
                  ? group.availableOfflineEvents
                  : "Could not determine current credits"
            }`,
            expectedCredits: `${
               group?.availableOfflineEvents ||
               "Could not determine current credits"
            } + ${
               totalQuantityBought !== undefined
                  ? totalQuantityBought
                  : "Could not determine quantity bought"
            }`,
            quantityToIncrease: `${
               totalQuantityBought !== undefined
                  ? totalQuantityBought
                  : "Could not determine quantity bought"
            }`,
            customerEmail:
               metadata?.userEmail ||
               "Could not determine customer email in metadata",
            customerName:
               metadata?.userName ||
               "Could not determine customer name in metadata",
         }
      )
      logAndThrow(
         "Error handling Stripe Offline Event checkout 'checkout.session.completed' event",
         error
      )
   }
}
