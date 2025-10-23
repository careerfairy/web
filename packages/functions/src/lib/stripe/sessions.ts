import { StripeProductType } from "@careerfairy/shared-lib/stripe/types"
import { handleGroupPlanSession } from "./products/groupPlans"
import { handleOfflineEventSession } from "./products/offlineEvents"

/**
 * Map of product types to their session handlers
 */
export const sessionHandlers = {
   [StripeProductType.GROUP_PLAN]: handleGroupPlanSession,
   [StripeProductType.OFFLINE_EVENT]: handleOfflineEventSession,
}
