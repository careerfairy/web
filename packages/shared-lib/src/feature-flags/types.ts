import { ParsedUrlQuery } from "querystring"

export type FlagKeys =
   | "atsAdminPageFlag"
   | "sparksAdminPageFlag"
   | "sparksB2BOnboardingFlag"
   | "livestreamCreationFlowV2"
   | "jobHubV1"
   | "mentorsV1"
   | "talentProfileV1"
   | "levelsV1"
   | "contentPlacementV1"
export type FeatureFlag = {
   /**
    * Initial state for the flag, usually disabled (false)
    */
   enabled: boolean

   /**
    * Useful to activate the feature on certain conditions (certain paths and params)
    * Optional
    * @param path
    * @param params
    */
   conditionalEnable?: (path: string, params: ParsedUrlQuery) => boolean
}

export type FeatureFlagsDetails = Record<FlagKeys, FeatureFlag>

export type FeatureFlagsState = Record<FlagKeys, boolean>
