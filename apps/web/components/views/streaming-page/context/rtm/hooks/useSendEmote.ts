import { EmoteType } from "context/agora/RTMContext"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"
import { useRTMChannel, useRTMClient } from "../providers"

type SendEmoteRequest = {
   emoteType: EmoteType
}

type Fetcher = MutationFetcher<void, unknown, SendEmoteRequest>

export const useSendEmote = () => {
   const rtmClient = useRTMClient()
   const rtmChannel = useRTMChannel()

   const sendEmoteFetcher: Fetcher = async (_, opts) => {
      if (!rtmClient || !rtmChannel) {
         console.warn("RTM client or channel not available")
         return
      }

      const message = rtmClient.createMessage({
         text: opts.arg.emoteType,
         messageType: "TEXT",
      })

      // 1. Optimistically dispatch emote locally to the UI

      // 2. Emit the emote event into the signaling API
      await rtmChannel.sendMessage(message)

      // 3. Save the emote document in firestore
   }

   return useSWRMutation("sendEmote", sendEmoteFetcher, {
      onError: (error) => {
         errorLogAndNotify(error, {
            message: "Failed to send emote",
         })
      },
   })
}
