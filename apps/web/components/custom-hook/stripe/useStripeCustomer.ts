import useSWR, { SWRConfiguration } from "swr"

import { useMemo } from "react"
import { Group } from "@careerfairy/shared-lib/groups"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"
import { errorLogAndNotify } from "util/CommonUtil"
import Stripe from "stripe"

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
   customer: Stripe.Customer
}

/**
 * Creates a session based on the given details, creates or updates an existing Stripe customer
 * with the additional details.
 * @param group Group object, the groupId is used as customerId
 * @param plan  The plan for the group to subscribe to
 * @param userEmail Current HR rep email
 * @returns customerSessionSecret Stripe customer session to be used in the checkout process
 */
const useStripeCustomer = (group: Group) => {
   const fetcher = useFunctionsSWR<Result[]>()

   const options = useMemo(() => {
      return {
         customerId: group.groupId,
      }
   }, [group.groupId])
   const { data } = useSWR(
      ["fetchStripeCustomer", options],
      fetcher,
      swrOptions
   )

   return useMemo(() => {
      return {
         customer: data.customer,
      }
   }, [data])
}

export default useStripeCustomer
