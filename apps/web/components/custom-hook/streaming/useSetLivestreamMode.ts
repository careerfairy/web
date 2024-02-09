import { UID } from "agora-rtc-react"
import { errorLogAndNotify } from "util/CommonUtil"
import {
   SetModeOptionsType,
   livestreamService,
} from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"
import { LivestreamMode } from "@careerfairy/shared-lib/livestreams"

export type StreamerDetails = Awaited<
   ReturnType<typeof livestreamService.getStreamerDetails>
>

type Options = {
   livestreamId: string
   agoraUid: UID
}

export const useSetLivestreamMode = (options: Options) => {
   const key = Object.values(options).every(Boolean)
      ? `set-livestream-mode-${options.livestreamId}`
      : null

   return useSWRMutation<
      void,
      Error,
      string,
      SetModeOptionsType<LivestreamMode>
   >(key, (_, { arg: mode }) =>
      livestreamService
         .setLivestreamMode(options.livestreamId, mode)
         .catch((error) => {
            errorLogAndNotify(error, {
               message: "Failed to set livestream mode",
               options,
               mode,
            })
            throw error
         })
   )
}
