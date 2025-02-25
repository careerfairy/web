import { EmoteType } from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import { useAppDispatch } from "components/custom-hook/store"
import { livestreamService } from "data/firebase/LivestreamService"
import { addEmote } from "store/reducers/streamingAppReducer"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerEvent } from "util/analyticsUtils"
import { useRTMChannel, useRTMClient } from "../providers"

type SendEmoteRequest = {
   emoteType: EmoteType
}

type Fetcher = MutationFetcher<void, unknown, SendEmoteRequest>

export const useSendEmote = (livestreamId: string, agoraUserId: string) => {
   const rtmClient = useRTMClient()
   const rtmChannel = useRTMChannel()
   const { authenticatedUser } = useAuth()
   const dispatch = useAppDispatch()

   const sendEmoteFetcher: Fetcher = async (_, opts) => {
      // Optimistically dispatch emote locally for the UI
      dispatch(addEmote(opts.arg.emoteType))

      // Save the emote document in firestore for pdf reporting, we don't need to await this
      livestreamService
         .addEmote(
            livestreamId,
            opts.arg.emoteType,
            agoraUserId,
            authenticatedUser.uid
         )
         .catch(errorLogAndNotify)

      switch (opts.arg.emoteType) {
         case "clapping":
            dataLayerEvent(AnalyticsEvents.LivestreamViewerReactionClap)
            break
         case "confused":
            dataLayerEvent(AnalyticsEvents.LivestreamViewerReactionConfused)
            break
         case "heart":
            dataLayerEvent(AnalyticsEvents.LivestreamViewerReactionHeart)
            break
         case "like":
            dataLayerEvent(AnalyticsEvents.LivestreamViewerReactionLike)
            break
      }

      if (!rtmClient || !rtmChannel) {
         errorLogAndNotify(
            new Error(
               "RTM client or channel not available, possibly due to firewall restrictions"
            )
         )
         return
      }

      const message = rtmClient.createMessage({
         text: opts.arg.emoteType,
         messageType: "TEXT",
      })

      await rtmChannel.sendMessage(message)
   }

   return useSWRMutation("sendEmote", sendEmoteFetcher, {
      onError: (error, key) => {
         errorLogAndNotify(error, {
            message: "Failed to send emote",
            key,
         })
      },
   })
}
