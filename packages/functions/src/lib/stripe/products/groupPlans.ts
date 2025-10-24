import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import {
   GroupPlanFetchStripeCustomerSession,
   GroupPlanSessionMetadata,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import { groupRepo } from "../../../api/repositories"
import { IStripeFunctionsRepository } from "../index"
import functions = require("firebase-functions")

export async function handleGroupPlanSession(
   customerId: string,
   returnUrl: string,
   data: GroupPlanFetchStripeCustomerSession,
   stripeRepo: IStripeFunctionsRepository
): Promise<Stripe.Checkout.Session> {
   const metadata: GroupPlanSessionMetadata = {
      groupId: data.groupId,
      userEmail: data.customerEmail,
      userName: data.customerName,
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

export async function handleGroupPlanCheckoutSessionCompleted(
   event: Stripe.CheckoutSessionCompletedEvent
): Promise<void> {
   const metadata = event?.data?.object?.metadata

   if (metadata?.plan) {
      const plan = metadata.plan as GroupPlanType
      await groupRepo.startPlan(metadata.groupId, plan)

      functions.logger.info(
         `✅ Successfully processed group-plan event for Customer: ${metadata.groupId}, Plan: ${metadata.plan}`
      )
   } else {
      functions.logger.error(
         "Could not process group-plan checkout 'checkout.session.completed' event - missing plan in metadata",
         metadata
      )
   }
}
