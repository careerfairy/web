import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { groupRepo } from "data/RepositoryInstances"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

/**
 * Fetch creators for multiple host groups using SWR
 */
export const useHostsCreatorsSWR = (groupIds: string[] = []) => {
   const fetchCreators = async () => {
      if (!groupIds.length) return []
      return groupRepo.getCreatorsFromMultipleGroups(groupIds)
   }

   const swrKey =
      groupIds.length > 0 ? `hosts-creators-${groupIds.join("-")}` : null

   const { data, isLoading, isValidating, error, mutate } = useSWR<Creator[]>(
      swrKey,
      fetchCreators,
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
         onError: (error, key) =>
            errorLogAndNotify(error, {
               message: `Error fetching hosts creators: ${key}`,
               details: { groupIds },
            }),
      }
   )

   return {
      data: data || [],
      isLoading,
      isValidating,
      error,
      mutate,
   }
}
