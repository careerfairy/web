import { useContext } from "react"
import { FeatureFlagsContext } from "../../HOCs/FeatureFlagsProvider"

/**
 * Access to feature flag values
 *
 * Feature flag values are set by FeatureFlagsProvider
 * internally uses a react context to store the flags state
 */
export const useFeatureFlags = () => {
   return useContext(FeatureFlagsContext)
}

export default useFeatureFlags
