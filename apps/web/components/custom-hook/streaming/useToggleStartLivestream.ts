import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   boolean // Should start the livestream
>

/**
 * Custom hook to toggle the start status of a livestream.
 * Utilizes SWR mutation for data fetching and state management.
 *
 * @param {string} livestreamId - The ID of the livestream to toggle.
 * @returns An object containing the SWR mutation trigger function and error handling.
 */
export const useUpdateLivestreamStartEndState = (livestreamId: string) => {
   const fetcher: FetcherType = async (_, options) => {
      return livestreamService.updateLivestreamStartEndState(
         livestreamId,
         options.arg
      )
   }

   return useSWRMutation(`start-livestream-${livestreamId}`, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Failed to toggle start status of livestream",
            key,
         }),
   })
}
