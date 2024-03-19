import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Custom hook to toggle the start status of a livestream.
 * Utilizes SWR mutation for data fetching and state management.
 *
 * @param {string} livestreamId - The ID of the livestream to toggle.
 * @param {boolean} started - The new start status of the livestream.
 * @returns An object containing the SWR mutation trigger function and error handling.
 */
export const useToggleStartLivestream = (
   livestreamId: string,
   started: boolean
) => {
   const fetcher = async () => {
      return livestreamService.setLivestreamHasStarted(livestreamId, started)
   }

   return useSWRMutation(`start-livestream-${livestreamId}`, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Failed to toggle start status of livestream",
            key,
         }),
   })
}
