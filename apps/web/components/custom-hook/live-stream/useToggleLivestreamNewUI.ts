import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   void
>

/**
 * Custom hook to toggle the new UI of the live stream room.
 *
 * @param {string} livestreamId - The ID of the livestream to toggle.
 * @returns An object containing the SWR mutation trigger function and error handling.
 */
export const useToggleLivestreamNewUI = (livestreamId: string) => {
   const fetcher: FetcherType = async () => {
      return livestreamService.toggleNewUI(livestreamId)
   }

   return useSWRMutation(`toggle-livestream-newUI-${livestreamId}`, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Failed to toggle new UI of livestream",
            key,
         }),
   })
}
