import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions"
import {
   GetGroupTalentEngagementFnArgs,
   GetGroupTalentEngagementFnResponse,
   GetTotalUsersMatchingTargetingResponse,
} from "@careerfairy/shared-lib/functions/types"
import { Group } from "@careerfairy/shared-lib/groups"
import isEmpty from "lodash/isEmpty"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

type CombinedResponse = GetGroupTalentEngagementFnResponse &
   GetTotalUsersMatchingTargetingResponse

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
 * Fetches:
 * - The number of unique users who registered for the group's targeted livestreams and match the targeting criteria.
 * - The total number of users matching the group's targeting criteria.
 *
 * If the group has no targeting criteria, the total is set to 5 times the actual count.
 */
export const useGroupTalentEngagement = (group: Group | undefined) => {
   const fetcher = useFunctionsSWRFetcher<GetGroupTalentEngagementFnResponse>()
   const totalFetcher =
      useFunctionsSWRFetcher<GetTotalUsersMatchingTargetingResponse>()

   const functionArgs = group ? extractTargetingFromGroup(group) : null

   // Fetch registered users count (users who registered to livestreams and match targeting)
   const registeredUsersKey = group
      ? [FUNCTION_NAMES.getGroupTalentEngagement, functionArgs]
      : null

   const registeredUsersResponse = useSWR<GetGroupTalentEngagementFnResponse>(
      registeredUsersKey,
      fetcher,
      swrOptions
   )

   // Check if group has no targeting criteria
   const hasNoTargeting =
      group &&
      isEmpty(group.targetedCountries) &&
      isEmpty(group.targetedUniversities) &&
      isEmpty(group.targetedFieldsOfStudy)

   // Fetch total users matching targeting (skip if no targeting to save costs)
   const totalUsersKey =
      functionArgs && !hasNoTargeting
         ? [FUNCTION_NAMES.getTotalUsersMatchingTargeting, functionArgs]
         : null

   const totalUsersResponse = useSWR<GetTotalUsersMatchingTargetingResponse>(
      totalUsersKey,
      totalFetcher,
      swrOptions
   )

   // Combine the results
   const isLoading =
      registeredUsersResponse.isLoading || totalUsersResponse.isLoading
   const error = registeredUsersResponse.error || totalUsersResponse.error

   const combinedData: CombinedResponse | undefined =
      registeredUsersResponse.data &&
      (hasNoTargeting || totalUsersResponse.data)
         ? {
              // If no targeting, set total to 5x the count, otherwise use actual values
              count: registeredUsersResponse.data.count,
              total: hasNoTargeting
                 ? registeredUsersResponse.data.count * 5
                 : totalUsersResponse.data!.total,
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
         universities:
            group.targetedUniversities?.map((u) => ({
               id: u.id,
               name: u.name,
               country: u.country,
            })) || [],
         fieldsOfStudy: group.targetedFieldsOfStudy?.map((f) => f.id) || [],
      },
   }
}
