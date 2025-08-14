import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Custom hook to fetch all livestream questions for admin overview.
 * Orders by votes descending, then by timestamp ascending.
 * @param livestreamId - The unique identifier for the live stream.
 */
export const useAllLivestreamQuestions = (livestreamId: string | null) => {
   return useSWR(
      livestreamId ? ["livestreamQuestions", livestreamId] : null,
      () => livestreamService.getQuestions(livestreamId!),
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
         onError: (err) => {
            errorLogAndNotify(err, {
               message: "Error in useAllLivestreamQuestions",
               livestreamId,
            })
         },
      }
   )
}
