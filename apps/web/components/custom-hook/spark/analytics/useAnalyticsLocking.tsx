import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"
import { useAuth } from "HOCs/AuthProvider"
import { useGroup } from "layouts/GroupDashboardLayout"

export const useAnalyticsLocking = (
   tabToValidate: "overview" | "audience" | "competitor"
) => {
   let groupPlansToValidate = []

   switch (tabToValidate) {
      case "overview":
         groupPlansToValidate = [
            GroupPlanTypes.Tier1,
            GroupPlanTypes.Tier2,
            GroupPlanTypes.Tier3,
         ]
         break
      case "audience":
         groupPlansToValidate = [GroupPlanTypes.Tier2, GroupPlanTypes.Tier3]
         break
      case "competitor":
         groupPlansToValidate = [GroupPlanTypes.Tier3]
         break
      default:
         throw new Error(`Invalid tab to validate: ${tabToValidate}`)
   }

   const { group } = useGroup()
   const { userData } = useAuth()
   const planStatus = useGroupPlanIsValid(group.groupId, groupPlansToValidate)

   const shouldLockAnalytics = !userData.isAdmin && !planStatus.valid

   return { isLocked: shouldLockAnalytics }
}
