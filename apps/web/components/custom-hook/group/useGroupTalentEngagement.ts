import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions"
import { GetGroupTalentEngagementFnArgs } from "@careerfairy/shared-lib/functions/types"
import { Group } from "@careerfairy/shared-lib/groups"
import isEmpty from "lodash/isEmpty"
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
   suspense: false,
   onError: (error, key) => {
      errorLogAndNotify(error, {
         message: "Error fetching group talent engagement",
         key,
      })
   },
}

/**
 * Custom hook to get group talent engagement count
 * Returns the count of unique users who registered to the group's targeted livestreams
 * and match the targeting criteria, plus the total count of users matching the targeting criteria
 *
 * @param group - The group object containing targeting criteria
 * @returns SWR response with combined data containing count, total, loading state, and error state
 */
export const useGroupTalentEngagement = (group: Group | undefined) => {
   const fetcher = useFunctionsSWRFetcher<GroupTalentEngagementResponse>()
   const totalFetcher =
      useFunctionsSWRFetcher<TotalUsersMatchingTargetingResponse>()

   const functionArgs = group ? extractTargetingFromGroup(group) : null

   // Fetch registered users count (users who registered to livestreams and match targeting)
   const registeredUsersKey = group
      ? [FUNCTION_NAMES.getGroupTalentEngagement, functionArgs]
      : null

   const registeredUsersResponse = useSWR<GroupTalentEngagementResponse>(
      registeredUsersKey,
      fetcher,
      swrOptions
   )

   // Fetch total users matching targeting
   const totalUsersKey = functionArgs
      ? [FUNCTION_NAMES.getTotalUsersMatchingTargeting, functionArgs]
      : null

   const totalUsersResponse = useSWR<TotalUsersMatchingTargetingResponse>(
      totalUsersKey,
      totalFetcher,
      swrOptions
   )

   // Combine the results
   const isLoading =
      registeredUsersResponse.isLoading || totalUsersResponse.isLoading
   const error = registeredUsersResponse.error || totalUsersResponse.error

   // Check if group has no targeting criteria
   const hasNoTargeting =
      group &&
      isEmpty(group.targetedCountries) &&
      isEmpty(group.targetedUniversities) &&
      isEmpty(group.targetedFieldsOfStudy)

   const combinedData: CombinedResponse | undefined =
      registeredUsersResponse.data && totalUsersResponse.data
         ? {
              // Return adjusted count as the main count (20% of total if no targeting)
              count: hasNoTargeting
                 ? Math.round(totalUsersResponse.data.total * 0.2)
                 : registeredUsersResponse.data.count,
              total: totalUsersResponse.data.total,
           }
         : undefined

   return {
      data: combinedData,
      isLoading,
      error,
      mutate: () => {
         registeredUsersResponse.mutate()
         totalUsersResponse.mutate()
      },
   }
}

/**
 * Extracts targeting criteria from group data
 */
export function extractTargetingFromGroup(
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
