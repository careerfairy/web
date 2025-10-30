import {
   BaseSessionPayload,
   GroupPlanFetchStripeCustomerSession,
   OfflineEventFetchStripeCustomerSession,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import { IStripeFunctionsRepository } from "./index"
import { handleGroupPlanSession } from "./products/groupPlans"
import { handleOfflineEventSession } from "./products/offlineEvents"

/**
 * Creates session handlers with the provided stripeRepo instance
 */
export const createSessionHandlers = (
   stripeRepo: IStripeFunctionsRepository
): Record<
   StripeProductType,
   (
      customerId: string,
      returnUrl: string,
      data: BaseSessionPayload
   ) => Promise<Stripe.Checkout.Session>
> => ({
   [StripeProductType.GROUP_PLAN]: (
      customerId: string,
      returnUrl: string,
      data: BaseSessionPayload
   ) =>
      handleGroupPlanSession(
         customerId,
         returnUrl,
         data as GroupPlanFetchStripeCustomerSession,
         stripeRepo
      ),
   [StripeProductType.OFFLINE_EVENT]: (
      customerId: string,
      returnUrl: string,
      data: BaseSessionPayload
   ) =>
      handleOfflineEventSession(
         customerId,
         returnUrl,
         data as OfflineEventFetchStripeCustomerSession,
         stripeRepo
      ),
})
