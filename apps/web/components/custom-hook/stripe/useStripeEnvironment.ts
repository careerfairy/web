import {
   StripeEnvironment,
   StripeEnvironments,
} from "@careerfairy/shared-lib/stripe/types"
import { isTestEnvironment, shouldUseEmulators } from "util/CommonUtil"

/**
 * Determines which Stripe environment to use based on the current environment
 * @returns StripeEnvironments.Test for local/test environments, StripeEnvironments.Prod for production
 */
export const getStripeEnvironment = (): StripeEnvironment => {
   let stripeEnv = null

   if (isTestEnvironment() || shouldUseEmulators()) {
      stripeEnv = StripeEnvironments.Test
   } else {
      stripeEnv = StripeEnvironments.Prod
   }

   console.log("🚀 ~ getStripeEnvironment ~ stripeEnv:", stripeEnv)
   return stripeEnv
}
