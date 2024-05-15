import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   number // The amount to increment/decrement the page number by
>

/**
 * Custom hook for updating the page number of a livestream presentation.
 *
 * @param {string} livestreamId - The ID of the livestream for which the page number is to be updated.
 * @returns An object containing the SWR response and a function to trigger the page update.
 */
export const useUpdatePresentationPageNumber = (livestreamId: string) => {
   const fetcher: FetcherType = async (_, options) => {
      return livestreamService.incrementLivestreamPage(
         livestreamId,
         options.arg
      )
   }
   return useSWRMutation(
      livestreamId ? `update-presentation-page-number/${livestreamId}` : null,
      fetcher,
      {
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Error updating livestream presentation page number",
               key,
            })
         },
      }
   )
}
