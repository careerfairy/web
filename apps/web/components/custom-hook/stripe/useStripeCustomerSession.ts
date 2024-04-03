import useSWR, { SWRConfiguration } from "swr"

import { useMemo } from "react"
import { Group, GroupPlanType } from "@careerfairy/shared-lib/groups"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"
import { errorLogAndNotify } from "util/CommonUtil"
import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/groups/planConstants"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching Stripe Customer Session with options: ${key}`,
      }),
}

/**
 * Stripe Session secret, a key that's unique to the individual PaymentIntent.
 * On the client side, Stripe.js uses the client secret as a parameter when invoking functions (such as stripe.confirmCardPayment
 *  or stripe.handleCardAction) to complete the payment.
 */
type Result = {
   customerSessionSecret: string
   loading: boolean
   error: unknown
}
const CUSTOMER_ID_PREFIX = "Group_"
/**
 * Creates a session based on the given details, creates or updates an existing Stripe customer
 * with the additional details.
 * @param group Group object, the groupId is used as customerId
 * @param plan  The plan for the group to subscribe to
 * @param userEmail Current HR rep email
 * @returns customerSessionSecret Stripe customer session to be used in the checkout process
 */
const useStripeCustomerSession = (
   group: Group,
   plan: GroupPlanType,
   userEmail: string
) => {
   const fetcher = useFunctionsSWR<Result[]>()

   const options = useMemo(() => {
      return {
         customerId: CUSTOMER_ID_PREFIX.concat(group.groupId),
         plan: plan,
         customerEmail: userEmail,
         groupId: group.groupId,
         customerName: group.universityName,
         priceId: PLAN_CONSTANTS[plan].stripe.priceId(group.companyCountry.id),
         successUrl: `/group/${group.groupId}/admin/sparks?stripe_session_id={CHECKOUT_SESSION_ID}`,
      }
   }, [
      group.companyCountry.id,
      group.groupId,
      group.universityName,
      plan,
      userEmail,
   ])
   const { data, isLoading, error } = useSWR(
      ["fetchStripeCustomerSession", options],
      fetcher,
      swrOptions
   )

   if (error) {
      console.error("Error fetching stripe customer session: ", error)
   }
   return useMemo(() => {
      return {
         customerSessionSecret: data.customerSessionSecret,
         loading: isLoading,
         error: error,
      }
   }, [data.customerSessionSecret, isLoading, error])
}

export default useStripeCustomerSession
