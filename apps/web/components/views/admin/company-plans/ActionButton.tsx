import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { LoadingButton } from "@mui/lab"
import { ButtonProps } from "@mui/material"
import { Button } from "@mui/material"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { groupPlanService } from "data/firebase/GroupPlanService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   sparksMemberBtn: {
      backgroundColor: "#F6F6FA !important",
      color: "#CACACA !important",
   },
})

type Props = {
   presenter: GroupPresenter
   onClick: ButtonProps["onClick"]
}

const fetcher: MutationFetcher<void, string, StartPlanData> = (_, { arg }) =>
   void groupPlanService.startPlan(arg)

const ActionButton = ({ presenter, onClick }: Props) => {
   const isTier1 = presenter.plan?.type === GroupPlanTypes.Tier1
   const isTrial = presenter.plan?.type === GroupPlanTypes.Trial

   const { successNotification } = useSnackbarNotifications()

   const { trigger, isMutating } = useSWRMutation(
      `startPlan-${presenter.id}`,
      fetcher
   )

   const startPlan = async (planType: GroupPlanType) => {
      const planData: StartPlanData = {
         planType: planType,
         groupId: presenter.id,
      }
      successNotification(
         `Backend call to start ${planType} plan not implemented yet`
      )
      // await trigger(planData) TODO: uncomment this when backend is ready
   }

   if (presenter.hasPlan()) {
      if (isTrial) {
         return (
            <LoadingButton
               onClick={onClick}
               loading={isMutating}
               variant="contained"
               fullWidth
            >
               Upgrade to full Sparks
            </LoadingButton>
         )
      }

      if (isTier1) {
         return (
            <Button
               sx={styles.sparksMemberBtn}
               disabled
               variant="contained"
               fullWidth
            >
               Sparks member
            </Button>
         )
      }
   }

   return (
      <LoadingButton
         onClick={onClick}
         loading={isMutating}
         variant="contained"
         fullWidth
      >
         Choose a plan
      </LoadingButton>
   )
}

export default ActionButton
