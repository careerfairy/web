import { GroupPlanType } from "."

const PREMIUM_FEATURES: PlanFeatureItem[] = [
   {
      enabled: true,
      name: "Unlimited Sparks slots",
   },
   {
      enabled: true,
      name: "Unlimited featured employees",
   },
   {
      enabled: true,
      name: "General analytics",
   },
   {
      enabled: true,
      name: "Reach and audience analytics",
   },
   {
      enabled: true,
      name: "Competitor analytics",
   },
   {
      enabled: true,
      name: "Dedicated KAM",
   },
   {
      enabled: true,
      name: "11'000 - 13’000 Exposure range",
   },
]
const ADVANCED_FEATURES: PlanFeatureItem[] = [
   {
      enabled: true,
      name: "10 Sparks slots",
   },
   {
      enabled: true,
      name: "Up to 7 featured employees",
   },
   {
      enabled: true,
      name: "General analytics",
   },
   {
      enabled: true,
      name: "Reach and audience analytics",
   },
   {
      enabled: false,
      name: "Competitor analytics",
   },
   {
      enabled: true,
      name: "Dedicated KAM",
   },
   {
      enabled: true,
      name: "7'000 - 8’000 Exposure range",
   },
]
const ESSENTIAL_FEATURES: PlanFeatureItem[] = [
   {
      enabled: true,
      name: "6 Sparks slots",
   },
   {
      enabled: true,
      name: "General analytics",
   },
   {
      enabled: true,
      name: "Up to 4 featured employees",
   },
   {
      enabled: false,
      name: "Reach and audience analytics",
   },
   {
      enabled: false,
      name: "Competitor analytics",
   },
   {
      enabled: false,
      name: "Dedicated KAM",
   },
   {
      enabled: true,
      name: "4'000 - 5’000 Exposure range",
   },
]
export type PlanFeature = "sparks" | "jobs"

/**
 * Configurations related to Stripe payments, the important ones are:
 *  - priceId: Unique ID of the Stripe price, defines a unique campaign e.g: Sparks 1 Year subscription / 5.000 CHF
 *       Not used for now, but can be if manual checkout is implemented.
 *  - buttonId: Stripe button ID, used for embedded checkout process.
 */
type StripeConfig = {
   priceId: string
   buttonId: string
}

export type PlanFeatureItem = {
   enabled: boolean
   name: string
}
interface AnalyticsPlanConstants {
   MINIMUM_DUMMY: number
}
interface SparksPlanConstants {
   /** The minimum number of creators required to publish sparks. */
   MINIMUM_CREATORS_TO_PUBLISH_SPARKS: number
   /** The minimum number of sparks required per creator to publish sparks. */
   MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: number
   /** The maximum number of public sparks for a specific group. */
   MAX_PUBLIC_SPARKS: number
   /** The maximum number of creators for a specific group. */
   MAX_SPARK_CREATOR_COUNT: number
   /** The duration of the plan in milliseconds. */
   PLAN_DURATION_MILLISECONDS: number
   /**
    * The duration of the trial creation period in milliseconds.
    * This is optional as it only applies to the trial plan.
    */
   TRIAL_CREATION_PERIOD_MILLISECONDS?: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JobsPlanConstants {
   // Empty for now - wgoncalves - disabled eslint for now
}

export type PlanConstants = {
   sparks: SparksPlanConstants
   jobs: JobsPlanConstants
   analytics?: AnalyticsPlanConstants
   stripe?: StripeConfig
   features?: PlanFeatureItem[]
}

export const PLAN_CONSTANTS: Record<GroupPlanType, PlanConstants> = {
   trial: {
      // Stripe price ID - Uniquely identifies a subscription
      // Additional Price info https://docs.stripe.com/products-prices/how-products-and-prices-work#what-is-a-price
      stripe: {
         priceId: process.env.SPARKS_TRIAL_STRIPE_PRICE_ID,
         buttonId: process.env.NEXT_PUBLIC_SPARKS_STRIPE_1_YEAR_BUY_BUTTON_ID,
      },
      features: ESSENTIAL_FEATURES,
      sparks: {
         MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 1,
         MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
         MAX_PUBLIC_SPARKS: 6,
         MAX_SPARK_CREATOR_COUNT: 1,
         PLAN_DURATION_MILLISECONDS: 1000 * 60 * 60 * 24 * 75, // 2.5 months
         TRIAL_CREATION_PERIOD_MILLISECONDS: 1000 * 60 * 60 * 24 * 14, // 2 weeks
      },
      jobs: {
         // Empty for now
      },
   },
   tier1: {
      // Stripe price ID - Uniquely identifies a subscription
      // Additional Price info https://docs.stripe.com/products-prices/how-products-and-prices-work#what-is-a-price
      stripe: {
         priceId: process.env.SPARKS_TRIAL_STRIPE_PRICE_ID,
         buttonId: process.env.NEXT_PUBLIC_SPARKS_STRIPE_1_YEAR_BUY_BUTTON_ID,
      },
      features: ESSENTIAL_FEATURES,
      sparks: {
         MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 1,
         MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
         MAX_PUBLIC_SPARKS: 15,
         MAX_SPARK_CREATOR_COUNT: 200, // No limit
         PLAN_DURATION_MILLISECONDS: 1000 * 60 * 60 * 24 * 365, // 1 year
      },
      jobs: {
         // Empty for now
      },
   },
   advanced: {
      // Stripe price ID - Uniquely identifies a subscription
      // Additional Price info https://docs.stripe.com/products-prices/how-products-and-prices-work#what-is-a-price
      stripe: {
         priceId: process.env.SPARKS_TRIAL_STRIPE_PRICE_ID,
         buttonId: process.env.NEXT_PUBLIC_SPARKS_STRIPE_1_YEAR_BUY_BUTTON_ID,
      },
      features: ADVANCED_FEATURES,
      sparks: {
         MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 1,
         MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
         MAX_PUBLIC_SPARKS: 6,
         MAX_SPARK_CREATOR_COUNT: 4,
         PLAN_DURATION_MILLISECONDS: 1000 * 60 * 60 * 24 * 365, // 1 year
      },
      analytics: {
         MINIMUM_DUMMY: 1,
      },
      jobs: {
         // Empty for now
      },
   },
   premium: {
      // Stripe price ID - Uniquely identifies a subscription
      // Additional Price info https://docs.stripe.com/products-prices/how-products-and-prices-work#what-is-a-price
      stripe: {
         priceId: process.env.SPARKS_TRIAL_STRIPE_PRICE_ID,
         buttonId: process.env.NEXT_PUBLIC_SPARKS_STRIPE_1_YEAR_BUY_BUTTON_ID,
      },
      features: PREMIUM_FEATURES,
      sparks: {
         MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 1,
         MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
         MAX_PUBLIC_SPARKS: 6,
         MAX_SPARK_CREATOR_COUNT: 4,
         PLAN_DURATION_MILLISECONDS: 1000 * 60 * 60 * 24 * 365, // 1 year
      },
      analytics: {
         MINIMUM_DUMMY: 1,
      },
      jobs: {
         // Empty for now
      },
   },
}

/**
 * This function retrieves the plan constants for a given plan type.
 * If the plan type is not found, it defaults to the 'sparks' plan constants.
 *
 * @param planType - The type of the plan for which constants are to be retrieved.
 * @returns The constants for the given plan type.
 */
export const getPlanConstants = (planType: GroupPlanType): PlanConstants => {
   return PLAN_CONSTANTS[planType] || PLAN_CONSTANTS.tier1
}

export type StartPlanData = {
   /** The type of plan to create */
   planType: GroupPlanType
   /** The group ID for which to create the plan */
   groupId: string
}
