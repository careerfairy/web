import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import {
   GroupPlanFetchStripeCustomerSession,
   GroupPlanSessionMetadata,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import { groupRepo, stripeRepo } from "../../../api/repositories"
import functions = require("firebase-functions")

/**
 * Handles group plan session creation with full logic
 */
export async function handleGroupPlanSession(
   customerId: string,
   returnUrl: string,
   data: GroupPlanFetchStripeCustomerSession,
   sessionMetadataVersion: string
): Promise<Stripe.Checkout.Session> {
   const metadata: GroupPlanSessionMetadata = {
      groupId: data.groupId,
      userEmail: data.customerEmail,
      version: sessionMetadataVersion,
      type: StripeProductType.GROUP_PLAN,
      plan: data.plan,
   }

   return stripeRepo.createCheckoutSession({
      customerId,
      returnUrl,
      priceId: data.priceId,
      metadata,
   })
}

/**
 * Handles group plan webhook events
 */
export async function handleGroupPlanWebhook(
   event: Stripe.CheckoutSessionCompletedEvent
): Promise<void> {
   const metadata = event?.data?.object?.metadata

   if (metadata?.plan) {
      const plan = metadata.plan as GroupPlanType
      await groupRepo.startPlan(metadata.groupId, plan)

      functions.logger.info(
         "✅ Successfully processed group-plan event - Stripe Customer: " +
            JSON.stringify(metadata) +
            ", Group ID: ",
         metadata.groupId
      )
   } else {
      functions.logger.error(
         "Could not process group-plan webhook - missing plan in metadata: ",
         metadata
      )
   }
}
