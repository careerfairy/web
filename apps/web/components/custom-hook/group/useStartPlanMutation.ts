import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { groupPlanService } from "data/firebase/GroupPlanService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"

const fetcher: MutationFetcher<GroupPlanType, string, StartPlanData> = async (
   _,
   { arg: planPayload }
) => {
   await groupPlanService.startPlan(planPayload)
   return planPayload.planType // We return the new plan type so that we can display it in the success view
}

/**
 * Custom hook for starting a company's plan.
 *
 * Handles loading state and error notifications automatically.
 *
 * @param groupId - The ID of the group for which to start the plan
 *
 * @note Error notifications are handled via snackbar notifications.
 * @see {@link StartPlanData} for payload structure.
 * @see {@link GroupPlanType} for available plan types.
 */
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
