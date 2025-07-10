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
 * Custom hook for starting a group plan using SWR mutation.
 *
 * This hook provides functionality to start a new plan for a group, handling
 * loading states and error notifications automatically. It uses SWR mutation
 * for optimistic updates and proper error handling.
 *
 * @param groupId - The ID of the group for which to start the plan
 *
 * @returns Object containing:
 * - `trigger`: Function to trigger the plan start mutation. Accepts StartPlanData with planType and groupId
 * - `isMutating`: Boolean indicating if the mutation is currently in progress
 * - `updatedGroupPlanType`: The new plan type after successful mutation, undefined if not completed
 *
 * @example
 * ```tsx
 * const { trigger, isMutating, updatedGroupPlanType } = useStartPlanMutation(group.id)
 *
 * const handleStartTrial = () => {
 *    trigger({
 *       planType: GroupPlanTypes.Trial,
 *       groupId: group.id,
 *    })
 * }
 * ```
 *
 * @note Error notifications are automatically handled via snackbar notifications
 * @see {@link StartPlanData} for the required payload structure
 * @see {@link GroupPlanType} for available plan types
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
