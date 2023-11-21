import { GroupPlanType } from "."

export interface PlanConstants {
   /** The minimum number of creators required to publish sparks. */
   MINIMUM_CREATORS_TO_PUBLISH_SPARKS: number
   /** The minimum number of sparks required per creator to publish sparks. */
   MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: number
   /** The maximum number of public sparks for a specific group. */
   MAX_PUBLIC_SPARKS: number
   /** The maximum number of creators for a specific group. */
   MAX_SPARK_CREATOR_COUNT: number
   /** The duration of the plan in days. */
   PLAN_DURATION_DAYS: number
}

const PLAN_CONSTANTS: Record<GroupPlanType, PlanConstants> = {
   trial: {
      MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 1,
      MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
      MAX_PUBLIC_SPARKS: 6,
      MAX_SPARK_CREATOR_COUNT: 1,
      PLAN_DURATION_DAYS: 75, // 2.5 months
   },
   sparks: {
      MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 3,
      MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
      MAX_PUBLIC_SPARKS: 15,
      MAX_SPARK_CREATOR_COUNT: 100, // No limit
      PLAN_DURATION_DAYS: 365, // 1 year
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
   return PLAN_CONSTANTS[planType] || PLAN_CONSTANTS.sparks
}
