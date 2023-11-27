import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { LoadingButton } from "@mui/lab"
import { Badge, Button, Chip } from "@mui/material"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { groupPlanService } from "data/firebase/GroupPlanService"
import React from "react"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   expiredBtn: {
      backgroundColor: (theme) => `${theme.palette.error.main} !important`,
      color: (theme) => `${theme.palette.error.contrastText} !important`,
   },
   sparksMemberBtn: {
      backgroundColor: "#F6F6FA !important",
      color: "#CACACA !important",
   },
})

type Props = {
   presenter: GroupPresenter
}

const fetcher: MutationFetcher<void, string, StartPlanData> = (_, { arg }) =>
   void groupPlanService.startPlan(arg)

const ActionButton = ({ presenter }: Props) => {
   const isTier1 = presenter.plan?.type === GroupPlanTypes.Tier1
   const isTrial = presenter.plan?.type === GroupPlanTypes.Trial

   const { successNotification } = useSnackbarNotifications()

   const { trigger, isMutating } = useSWRMutation(
      `startPlan-${presenter.id}`,
      fetcher
   )

   const daysLef =
      presenter.getPlanDaysLeft() > 0
         ? `${presenter.getPlanDaysLeft()} days left`
         : "Expired"

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

   if (presenter.hasPlan() && presenter.hasPlanExpired()) {
      return (
         <Button
            disabled
            sx={styles.expiredBtn}
            color="error"
            variant="contained"
         >
            Trial expired
         </Button>
      )
   }

   if (isTrial) {
      return (
         <Badge
            badgeContent={
               <Chip label={daysLef} size="small" color="secondary" />
            }
         >
            <LoadingButton
               onClick={() => startPlan(GroupPlanTypes.Tier1)}
               loading={isMutating}
               variant="outlined"
            >
               Activate Sparks plan
            </LoadingButton>
         </Badge>
      )
   }

   if (isTier1) {
      return (
         <Badge
            badgeContent={
               <Chip label={daysLef} size="small" color="secondary" />
            }
         >
            <Button sx={styles.sparksMemberBtn} disabled variant="contained">
               Sparks member
            </Button>
         </Badge>
      )
   }

   return (
      <LoadingButton
         onClick={() => startPlan(GroupPlanTypes.Trial)}
         loading={isMutating}
         variant="contained"
      >
         Activate Sparks trial
      </LoadingButton>
   )
}

export default ActionButton
