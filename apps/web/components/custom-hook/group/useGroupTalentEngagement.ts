import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions"
import { GetGroupTalentEngagementFnArgs } from "@careerfairy/shared-lib/functions/types"
import { Group } from "@careerfairy/shared-lib/groups"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

type GroupTalentEngagementResponse = {
   count: number
}

type TotalUsersMatchingTargetingResponse = {
   total: number
}

type CombinedResponse = {
   count: number
   total: number
}

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   onError: (error, key) => {
      errorLogAndNotify(error, {
         message: "Error fetching group talent engagement",
         key,
      })
   },
}

/**
 * Custom hook to get group talent engagement count
 * Returns the count of unique users who have engaged with the group's targeted livestreams
 * and the total count of users matching the targeting criteria
 *
 * @param group - The group object containing targeting criteria
 * @returns SWR response with combined data containing count, total, loading state, and error state
 */
export const useGroupTalentEngagement = (group: Group | undefined) => {
   const fetcher = useFunctionsSWRFetcher<GroupTalentEngagementResponse>()
   const totalFetcher =
      useFunctionsSWRFetcher<TotalUsersMatchingTargetingResponse>()

   const groupArgs = group ? extractTargetingFromGroup(group) : null

   // Fetch engaged users count
   const engagedUsersKey = group
      ? [FUNCTION_NAMES.getGroupTalentEngagement, { groupId: group.id }]
      : null

   const engagedUsersResponse = useSWR<GroupTalentEngagementResponse>(
      engagedUsersKey,
      fetcher,
      swrOptions
   )

   // Fetch total users matching targeting
   const totalUsersKey = groupArgs
      ? [FUNCTION_NAMES.getTotalUsersMatchingTargeting, groupArgs]
      : null

   const totalUsersResponse = useSWR<TotalUsersMatchingTargetingResponse>(
      totalUsersKey,
      totalFetcher,
      swrOptions
   )

   // Combine the results
   const isLoading =
      engagedUsersResponse.isLoading || totalUsersResponse.isLoading
   const error = engagedUsersResponse.error || totalUsersResponse.error

   const combinedData: CombinedResponse | undefined =
      engagedUsersResponse.data && totalUsersResponse.data
         ? {
              count: engagedUsersResponse.data.count,
              total: totalUsersResponse.data.total,
           }
         : undefined

   return {
      data: combinedData,
      isLoading,
      error,
      mutate: () => {
         engagedUsersResponse.mutate()
         totalUsersResponse.mutate()
      },
   }
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
