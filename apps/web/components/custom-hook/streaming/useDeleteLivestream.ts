import { type DeleteLivestreamRequest } from "@careerfairy/shared-lib/functions/types"
import useSWRMutation from "swr/mutation"
import { livestreamService } from "../../../data/firebase/LivestreamService"

/**
 * Custom hook for deleting a livestream or draft using a cloud function.
 *
 * @param livestreamId - The ID of the livestream to delete
 * @param collection - The collection to delete the livestream from
 * @param groupId - The ID of the group the user must be admin of
 * @returns An object containing the SWR mutation trigger function and state.
 */
export const useDeleteLivestream = (options: DeleteLivestreamRequest) => {
   const key =
      options.livestreamId && options.collection
         ? `delete-${options.collection}-${options.livestreamId}`
         : null

   const fetcher = async () => {
      return livestreamService.deleteLivestream(options)
   }

   return useSWRMutation(key, fetcher)
}
