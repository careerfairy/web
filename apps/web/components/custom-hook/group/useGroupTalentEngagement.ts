import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions"
import { GetGroupTalentEngagementFnArgs } from "@careerfairy/shared-lib/functions/types"
import { Group } from "@careerfairy/shared-lib/groups"
import useSWR from "swr"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

interface GroupTalentEngagementResponse {
   count: number
}

/**
 * Extracts targeting criteria from group data
 */
function extractTargetingFromGroup(
   group: Group
): GetGroupTalentEngagementFnArgs {
   return {
      groupId: group.id,
      targeting: {
         countries: group.targetedCountries?.map((c) => c.id) || [],
         universities: group.targetedUniversities?.map((u) => u.id) || [],
         fieldsOfStudy: group.targetedFieldsOfStudy?.map((f) => f.id) || [],
      },
   }
}

/**
 * Hook to get the count of unique users who have seen any livestreams of a group
 * This includes users who have registered, participated, or joined the talent pool
 * Results are cached for 1 day on the server side
 * Cache key includes targeting criteria so results update when targeting changes
 *
 * @param group - The group object containing targeting criteria
 * @param options - SWR options
 * @returns Object containing count, loading state, and error state
 */
export const useGroupTalentEngagement = (group: Group | undefined) => {
   const fetcher = useFunctionsSWRFetcher<GroupTalentEngagementResponse>()

   const key = group
      ? [
           FUNCTION_NAMES.getGroupTalentEngagement,
           extractTargetingFromGroup(group),
        ]
      : null

   return useSWR<GroupTalentEngagementResponse>(
      key,
      fetcher,
      reducedRemoteCallsOptions
   )
}
