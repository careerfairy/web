import { GroupPlanType } from "."

interface PlanConstants {
   /** The minimum number of creators required to publish sparks. */
   MINIMUM_CREATORS_TO_PUBLISH_SPARKS: number
   /** The minimum number of sparks required per creator to publish sparks. */
   MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: number
   /** The maximum number of public sparks for a specific group. */
   MAX_PUBLIC_SPARKS: number
   /** The maximum number of creators for a specific group. */
   MAX_SPARK_CREATOR_COUNT: number
}

const PLAN_CONSTANTS: Record<GroupPlanType, PlanConstants> = {
   trial: {
      MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 1,
      MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
      MAX_PUBLIC_SPARKS: 6,
      MAX_SPARK_CREATOR_COUNT: 1,
   },
   sparks: {
      MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 3,
      MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,
      MAX_PUBLIC_SPARKS: 15,
      MAX_SPARK_CREATOR_COUNT: 100, // No limit
   },
}

export const getPlanConstants = (planType: GroupPlanType): PlanConstants => {
   return PLAN_CONSTANTS[planType] || PLAN_CONSTANTS.sparks
}
