import { useFeatureFlags } from "components/custom-hook/useFeatureFlags"
import { useGroup } from "layouts/GroupDashboardLayout"

/**
 * Custom hook to determine if the current user has access to Sparks features.
 * Checks both feature flags and group-level permissions.
 *
 * @returns True if user has access to Sparks, false otherwise.
 */
export const useHasAccessToSparks = () => {
   const { group } = useGroup()
   const featureFlags = useFeatureFlags()
   return Boolean(
      featureFlags?.sparksAdminPageFlag || group?.sparksAdminPageFlag
   )
}
