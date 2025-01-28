import {
   FeatureFlagsDetails,
   FeatureFlagsState,
} from "@careerfairy/shared-lib/feature-flags/types"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import React, { useEffect, useState } from "react"

const testGoups = ["rTUGXDAG2XAtpVcgvAcc", "qENR2aNDhehkLDYryTRN"]

const paramsHaveGroupIds = (params: ParsedUrlQuery, groupIds: string[]) => {
   return groupIds.includes(params?.groupId?.toString())
}

/**
 * Create a function that will return true if the path and params match the given groupIds
 * @param groupIds
 **/
const createFeatureFlagEnableCondition = (groupIds: string[]) => {
   return (path: string, params: ParsedUrlQuery) => {
      return paramsHaveGroupIds(params, groupIds)
   }
}

/**
 * All feature flags with initial state
 *
 * They can be activated via query string, e.g:
 * - ?atsAdminPageFlag=true
 * - ?sparksAdminPageFlag=true
 * - ?sparksB2BOnboardingFlag=true
 * - ?livestreamCreationFlowV2=true
 * - ?levelsV1=true
 */
export const flagsInitialState = {
   /**
    * Group Admin Dashboard ATS
    * Hide or Show
    */
   atsAdminPageFlag: {
      enabled: false,
      conditionalEnable: createFeatureFlagEnableCondition(testGoups),
   },
   /**
    * Group Admin Dashboard Sparks
    * Hide or Show
    */
   sparksAdminPageFlag: {
      enabled: false,
      conditionalEnable: createFeatureFlagEnableCondition(testGoups),
   },
   /**
    * Sparks B2B Onboarding Dialog
    * Hide or Show
    */
   sparksB2BOnboardingFlag: {
      enabled: false,
      conditionalEnable: createFeatureFlagEnableCondition(testGoups),
   },
   /**
    * B2B Live stream creation flow version 2
    * Hide or Show
    */
   livestreamCreationFlowV2: {
      enabled: true,
   },
   /**
    * New Job hub implementation
    * Hide or Show
    */
   jobHubV1: {
      enabled: true,
   },
   /**
    * B2C and B2B mentors
    * Hide or Show
    */
   mentorsV1: {
      enabled: true,
   },
   talentProfileV1: {
      enabled: false,
   },
   levelsV1: {
      enabled: false,
   },
} satisfies FeatureFlagsDetails

/**
 * Feature Flags provider
 * Will listen for path/query param changes and update the feature flag state
 *
 * Feature Flags can be read via useFeatureFlags hook
 * @param props
 * @constructor
 */
const FeatureFlagsProvider = (props) => {
   const router = useRouter()

   // map initial flag states
   const [flags, setFlags] = useState<FeatureFlagsState>(() => {
      const map = {} as FeatureFlagsState
      for (const key in flagsInitialState) {
         map[key] = flagsInitialState[key].enabled
      }
      return map
   })

   // update flags when changing pages / query string parameters
   useEffect(() => {
      // conditionally update flag states if present as query string parameters
      for (const queryParam in router.query) {
         const param = queryParam.toString()
         if (Object.keys(flagsInitialState).includes(param)) {
            setFlags((prev) => ({
               ...prev,
               [param]: router.query[queryParam] === "true",
            }))

            // return early so that we don't run the conditionalEnable function
            // query params have priority
            return
         }
      }

      // conditionally update flag states by running the fn conditionalEnable
      for (const flagKey in flagsInitialState) {
         if (flagsInitialState[flagKey].conditionalEnable) {
            const enabled = flagsInitialState[flagKey].conditionalEnable(
               router.pathname,
               router.query
            )

            setFlags((prev) => ({
               ...prev,
               [flagKey]: enabled,
            }))
         }
      }
   }, [router.query, router.pathname])

   return (
      <FeatureFlagsContext.Provider value={flags}>
         {props.children}
      </FeatureFlagsContext.Provider>
   )
}

export const FeatureFlagsContext = React.createContext<FeatureFlagsState>(null)

export default FeatureFlagsProvider
