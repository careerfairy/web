import useSWR, { SWRConfiguration } from "swr"

import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import {
   BaseFetchStripeCustomerSession,
   StripeCustomerSessionData,
} from "@careerfairy/shared-lib/stripe/types"
import { errorLogAndNotify, getStripeEnvironment } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

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

/**
 * Generic hook for creating Stripe customer sessions for different product types.
 * The hook accepts options that extend BaseFetchStripeCustomerSession (mandatory fields) and infers the correct
 * typing based on the StripeProductType. Some product types might needed additional data to be passed in the options (for example, the plan type for group plans).
 *
 * In the case of Offline Events, the are basically no options, since this product type doesn't require any additional data. In this case, the options are the same as the BaseFetchStripeCustomerSession but with
 * the type set to StripeProductType.OFFLINE_EVENT.
 *
 * @param options Session options that extend BaseFetchStripeCustomerSession
 * @returns customerSessionSecret Stripe customer session to be used in the checkout process
 *
 * @example
 * // For group plans (backward compatible):
 * const { data } = useStripeCustomerSession({
 *   type: StripeProductType.GROUP_PLAN,
 *   plan: GroupPlanType.PREMIUM,
 *   customerName: group.universityName,
 *   customerEmail: userEmail,
 *   groupId: group.groupId,
 *   priceId: "price_123",
 *   successUrl: "/success"
 * })
 *
 * @example
 * // For offline events:
 * const { data } = useStripeCustomerSession({
 *   type: StripeProductType.OFFLINE_EVENT,
 *   customerName: group.universityName,
 *   customerEmail: userEmail,
 *   groupId: group.groupId,
 *   priceId: "price_456",
 *   successUrl: "/offline-event-success"
 * })
 */
export const useStripeCustomerSession = <
   T extends BaseFetchStripeCustomerSession
>(
   options: T
) => {
   const fetcher = useFunctionsSWR<Result[]>()
   const stripeEnv = getStripeEnvironment()

   // Add environment to the options payload
   const optionsWithEnv = {
      ...options,
      environment: stripeEnv,
   }

   return useSWR<StripeCustomerSessionData>(
      [FUNCTION_NAMES.fetchStripeCustomerSession, optionsWithEnv],
      fetcher,
      {
         ...swrOptions,
         suspense: false,
         onError: (error) =>
            errorLogAndNotify(error, {
               message: `Error fetching Stripe Customer Session with`,
               options: optionsWithEnv,
            }),
      }
   )
}
