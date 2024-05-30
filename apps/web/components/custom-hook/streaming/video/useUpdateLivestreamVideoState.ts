import { LivestreamVideo } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

type Fetcher = MutationFetcher<
   void, // return type
   unknown, // error type
   Partial<Pick<LivestreamVideo, "state" | "second" | "updater">>
>

export const useUpdateLivestreamVideoState = (livestreamId: string) => {
   const fetcher: Fetcher = async (_, options) => {
      await livestreamService.updateVideoState(livestreamId, options.arg)
   }
   return useSWRMutation(
      livestreamId ? ["updateVideoState", livestreamId] : null,
      fetcher,
      {
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Error updating video state",
               key,
            })
         },
      }
   )
}
