import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { groupRepo } from "data/RepositoryInstances"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   suspense: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching creator content data with options: ${key}`,
      }),
}

/**
 * Get all the public content from a creator. Includes livestreams, sparks, and if
 * the corresponding group has any public jobs.
 *
 * @param creator the creator data
 * @returns an object with the livestreams and sparks the creator is a part of,
 * as well as if there's jobs available on the corresponding group.
 **/
const useCreatorPublicContent = (creator: Creator) => {
   const swrFetcher = async () => {
      return groupRepo.getCreatorPublicContent(creator.id, creator.groupId)
   }

   return useSWR(`creator-content-${creator.id}`, swrFetcher, swrOptions)
}

export default useCreatorPublicContent
