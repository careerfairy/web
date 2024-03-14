import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC } from "react"

type GroupPlanPaywallProps = {
   children: React.ReactNode
   plans: GroupPlanType[]
   fallback?: React.ReactNode
}
const GroupPlanPaywall: FC<GroupPlanPaywallProps> = ({
   plans,
   children,
   fallback,
}) => {
   const group = useGroup()
   const planValidation = useGroupPlanIsValid(group.group.groupId, plans)

   return (
      <ConditionalWrapper condition={planValidation.valid} fallback={fallback}>
         {children}
      </ConditionalWrapper>
   )
}

export default GroupPlanPaywall
