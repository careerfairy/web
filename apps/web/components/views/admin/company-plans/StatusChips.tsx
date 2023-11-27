import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { Chip } from "@mui/material"
import BasicSparkIcon from "components/views/common/icons/BasicSparkIcon"
import { groupPlanService } from "data/firebase/GroupPlanService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   chip: {
      borderRadius: "4px",
      padding: "4px 8px",
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
   },
})

type Props = {
   presenter: GroupPresenter
}

const fetcher: MutationFetcher<void, string, StartPlanData> = (_, { arg }) =>
   void groupPlanService.startPlan(arg)

const StatusChips = ({ presenter }: Props) => {
   const isTier1 = presenter.plan?.type === GroupPlanTypes.Tier1
   const isTrial = presenter.plan?.type === GroupPlanTypes.Trial

   const { trigger, isMutating } = useSWRMutation(
      `startPlan-${presenter.id}`,
      fetcher
   )

   const daysLef =
      presenter.getPlanDaysLeft() > 0
         ? `${presenter.getPlanDaysLeft()} days left`
         : "Expired"

   if (presenter.hasPlan() && presenter.hasPlanExpired()) {
   }

   if (isTrial) {
   }

   if (isTier1) {
   }

   return <Chip icon={<BasicSparkIcon />} label={daysLef} />
}

export default StatusChips
