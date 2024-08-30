import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"
import { useAuth } from "HOCs/AuthProvider"
import { useGroup } from "layouts/GroupDashboardLayout"

type ValidTabs = "overview" | "audience" | "competitor"
const ValidGroupPlans: { [tab in ValidTabs]: GroupPlanType[] } = {
   overview: [GroupPlanTypes.Tier1, GroupPlanTypes.Tier2, GroupPlanTypes.Tier3],
   audience: [GroupPlanTypes.Tier2, GroupPlanTypes.Tier3],
   competitor: [GroupPlanTypes.Tier3],
}

export const useAnalyticsLocking = (
   tabToValidate: "overview" | "audience" | "competitor"
) => {
   const groupPlansToValidate = ValidGroupPlans[tabToValidate]

   const { group } = useGroup()
   const { userData } = useAuth()
   const planStatus = useGroupPlanIsValid(group.groupId, groupPlansToValidate)

   const shouldLockAnalytics = !userData.isAdmin && !planStatus.valid

   return { isLocked: shouldLockAnalytics }
}
