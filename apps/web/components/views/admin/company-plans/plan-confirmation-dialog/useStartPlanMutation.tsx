import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { groupPlanService } from "data/firebase/GroupPlanService"

const fetcher: MutationFetcher<GroupPlanType, string, StartPlanData> = async (
   _,
   { arg: planPayload }
) => {
   await groupPlanService.startPlan(planPayload)
   return planPayload.planType // We return the new plan type so that we can display it in the success view
}

export const useStartPlanMutation = (groupId: string) => {
   const { errorNotification } = useSnackbarNotifications()

   const {
      trigger,
      isMutating,
      data: updatedGroupPlanType,
   } = useSWRMutation(`startPlan-${groupId}`, fetcher, {
      onError: errorNotification,
   })

   return { trigger, isMutating, updatedGroupPlanType }
}
