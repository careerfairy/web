import { errorLogAndNotify } from "util/CommonUtil"
import {
   SetModeOptionsType,
   livestreamService,
} from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { LivestreamMode } from "@careerfairy/shared-lib/livestreams"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   SetModeOptionsType<LivestreamMode> // args for the mutation method
>

export const useSetLivestreamMode = (livestreamId: string) => {
   const fetcher: FetcherType = async (_, options) =>
      livestreamService
         .setLivestreamMode(livestreamId, options.arg)
         .catch((error) => {
            errorLogAndNotify(error, {
               message: "Failed to set livestream mode",
               livestreamId,
               args: options.arg,
            })
            throw error
         })

   return useSWRMutation(`set-livestream-mode-${livestreamId}`, fetcher)
}
