import { GroupPlanType } from "."
import {
   ADVANCED_FEATURES,
   ESSENTIAL_FEATURES,
   PREMIUM_FEATURES,
   PlanFeatureItem,
} from "./planFeatures"

export type PlanFeature = "sparks" | "jobs"

/**
 * Configurations related to Stripe payments, the important ones are:
 *  - priceId: Unique ID of the Stripe price, defines a unique campaign e.g: Sparks 1 Year subscription / 5.000 CHF
 *       Not used for now, but can be if manual checkout is implemented.
 *
 * These are defined as functions as the Price IDs to be used change depending on group companyCountry.id
 * Additional Price info https://docs.stripe.com/products-prices/how-products-and-prices-work#what-is-a-price
 */
type StripeConfig = {
   priceId: (countryCode: string) => string
}

type AnalyticsPlanConstants = {
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

const resolveByCountry = (
   code: string,
   countryCode: string,
   value: string,
   fallback: string
) => {
   return code == countryCode ? value : fallback
}

export type PlanConstants = {
   name: string // Name of the plan, UI plan name
   description: string // Description of the plan, UI description
   sparks: SparksPlanConstants
   jobs: JobsPlanConstants
   analytics?: AnalyticsPlanConstants
   stripe: StripeConfig
   features: PlanFeatureItem[] // List of plan features, shown in UI for checkout
}

export const PLAN_CONSTANTS: Record<GroupPlanType, PlanConstants> = {
   trial: {
      name: "Trial",
      description: "Trial plan",
      stripe: {
         priceId: () => resolveByCountry("", "CH", "", ""), // Not to be used
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
      name: "Essential",
      description: "Jumpstart your employer branding",
      stripe: {
         priceId: (countryCode) =>
            resolveByCountry(
               countryCode,
               "CH",
               process.env.NEXT_PUBLIC_SPARKS_ESSENTIAL_STRIPE_PRICE_ID_CH,
               process.env.NEXT_PUBLIC_SPARKS_ESSENTIAL_STRIPE_PRICE_ID
            ),
      },
      features: ESSENTIAL_FEATURES,
      sparks: {
         MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 1,
         MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
         MAX_PUBLIC_SPARKS: 6,
         MAX_SPARK_CREATOR_COUNT: 4,
         PLAN_DURATION_MILLISECONDS: 1000 * 60 * 60 * 24 * 365, // 1 year
      },
      jobs: {
         // Empty for now
      },
   },
   tier2: {
      name: "Advanced",
      description: "Scale up your employer brand narrative",
      stripe: {
         priceId: (countryCode) =>
            resolveByCountry(
               countryCode,
               "CH",
               process.env.NEXT_PUBLIC_SPARKS_ADVANCED_STRIPE_PRICE_ID_CH,
               process.env.NEXT_PUBLIC_SPARKS_ADVANCED_STRIPE_PRICE_ID
            ),
      },
      features: ADVANCED_FEATURES,
      sparks: {
         MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 1,
         MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
         MAX_PUBLIC_SPARKS: 10,
         MAX_SPARK_CREATOR_COUNT: 7,
         PLAN_DURATION_MILLISECONDS: 1000 * 60 * 60 * 24 * 365, // 1 year
      },
      analytics: {
         MINIMUM_DUMMY: 1,
      },
      jobs: {
         // Empty for now
      },
   },
   tier3: {
      name: "Premium",
      description:
         "Gain unparalleled insights into your employer brand perception",
      stripe: {
         priceId: (countryCode) =>
            resolveByCountry(
               countryCode,
               "CH",
               process.env.NEXT_PUBLIC_SPARKS_PREMIUM_STRIPE_PRICE_ID_CH,
               process.env.NEXT_PUBLIC_SPARKS_PREMIUM_STRIPE_PRICE_ID
            ),
      },
      features: PREMIUM_FEATURES,
      sparks: {
         MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 1,
         MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
         MAX_PUBLIC_SPARKS: 200, // Unlimited
         MAX_SPARK_CREATOR_COUNT: 200, // Unlimited
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
