import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"
import { useAuth } from "HOCs/AuthProvider"
import { useGroup } from "layouts/GroupDashboardLayout"

export const useAnalyticsLocking = () => {
   const { group } = useGroup()
   const { userData } = useAuth()

   const planStatus = useGroupPlanIsValid(group.groupId, [
      GroupPlanTypes.Tier1,
      GroupPlanTypes.Tier2,
      GroupPlanTypes.Tier3,
   ])

   const shouldLockAnalytics = !userData.isAdmin && !planStatus.valid

   return { isLocked: shouldLockAnalytics }
}
