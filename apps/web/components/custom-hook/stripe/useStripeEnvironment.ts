import {
   StripeEnvironment,
   StripeEnvironments,
} from "@careerfairy/shared-lib/stripe/types"
import {
   getWorkflowId,
   isTestEnvironment,
   shouldUseEmulators,
} from "util/CommonUtil"

/**
 * Determines which Stripe environment to use based on the current environment
 * @returns StripeEnvironments.Test for local/test environments, StripeEnvironments.Prod for production
 */
export const getStripeEnvironment = (): StripeEnvironment => {
   // Use test Stripe for local development or test environments
   // We check:
   // 1. shouldUseEmulators() - for local development
   // 2. getWorkflowId() !== "unknown" - for CI tests (NEXT_PUBLIC_UNIQUE_WORKFLOW_ID is set in CI)
   // This is necessary because NODE_ENV is always "production" during next build,
   // even in CI, so we can't rely on it for client-side code
   const workflowId = getWorkflowId()
   console.log("🚀 ~ getStripeEnvironment ~ workflowId:", workflowId)
   const useEmulators = shouldUseEmulators()
   console.log("🚀 ~ getStripeEnvironment ~ useEmulators:", useEmulators)
   console.log(
      "🚀 ~ getStripeEnvironment ~ process.env.NEXT_PUBLIC_DEV_NAME:",
      process?.env?.NEXT_PUBLIC_DEV_NAME
   )

   const stripeEnv =
      useEmulators || workflowId !== "unknown" || isTestEnvironment()
         ? StripeEnvironments.Test
         : StripeEnvironments.Prod

   console.log("🚀 ~ getStripeEnvironment ~ stripeEnv:", stripeEnv)
   return StripeEnvironments.Test
}
