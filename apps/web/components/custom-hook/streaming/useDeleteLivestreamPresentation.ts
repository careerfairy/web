import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Custom hook using SWR for managing the deletion of a livestream PDF presentation.
 *
 * @param {string} livestreamId - The ID of the livestream for which the presentation is to be deleted.
 * @returns An object containing the SWR response and a function to trigger the deletion.
 */
export const useDeleteLivestreamPresentation = (livestreamId: string) => {
   return useSWRMutation(
      livestreamId ? `delete-livestream-presentation/${livestreamId}` : null,
      () => livestreamService.removeLivestreamPDFPresentation(livestreamId),
      {
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Error deleting livestream presentation",
               key,
            })
         },
      }
   )
}
