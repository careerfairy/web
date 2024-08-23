import { FeatureFlagsState } from "./types"

export interface IFeatureFlagsConsumer {
   readonly featureFlags: FeatureFlagsState
   setFeatureFlags(featureFlags: FeatureFlagsState): void
}
