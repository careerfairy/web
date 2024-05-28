import { EmoteType } from "@careerfairy/shared-lib/livestreams"
import AgoraRTC, { useClientEvent, useRTCClient } from "agora-rtc-react"
import { useAppDispatch } from "components/custom-hook/store"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import {
   addEmote,
   setAudioLevels,
   setRTCConnectionState,
   setRTMConnectionState,
   setViewCount,
} from "store/reducers/streamingAppReducer"
import {
   useRTMChannel,
   useRTMChannelEvent,
   useRTMClient,
   useRTMClientEvent,
} from "../../context/rtm"

export const AgoraTrackers = () => {
   const rtcClient = useRTCClient()

   const rtmChannel = useRTMChannel()
   const rtmClient = useRTMClient()

   const dispatch = useAppDispatch()
   const { enqueueSnackbar } = useSnackbar()

   /**
    * A hook that tracks and dispatches the audio levels of users in a streaming session.
    *
    * It listens for the "volume-indicator" event from the Agora RTC client,
    * which provides the audio levels of users. These levels are then dispatched to the Redux store
    * using the `setAudioLevels` action.
    */
   useClientEvent(rtcClient, "volume-indicator", (users) => {
      dispatch(setAudioLevels(users))
   })

   useClientEvent(
      rtcClient,
      "connection-state-change",
      (currentState, prevState, reason) => {
         dispatch(
            setRTCConnectionState({
               currentState,
               prevState,
               reason,
            })
         )
      }
   )

   useEffect(() => {
      AgoraRTC.onAutoplayFailed = () => {
         // TODO: Handle autoplay failure
         // ticket: https://linear.app/careerfairy/issue/CF-816/handle-videoaudio-track-autoplay-faliure
      }
   }, [rtcClient])

   useRTMChannelEvent(rtmChannel, "ChannelMessage", (message, memberId) => {
      enqueueSnackbar(`Emote sent by ${memberId}: ${message.text}`, {
         variant: "success",
      })

      const isValidEmote = Object.values(EmoteType).includes(
         message.text as EmoteType
      )

      if (message.messageType === "TEXT" && isValidEmote) {
         dispatch(
            addEmote({
               id: Date.now().toString(),
               type: message.text as EmoteType,
            })
         )
      }
   })

   useRTMChannelEvent(rtmChannel, "MemberCountUpdated", (newCount) => {
      dispatch(setViewCount(newCount))
   })

   useRTMClientEvent(
      rtmClient,
      "ConnectionStateChanged",
      (newState, reason) => {
         dispatch(setRTMConnectionState({ state: newState, reason }))
      }
   )

   useEffect(() => {
      if (!rtmChannel) {
         dispatch(setViewCount(0))
      }
   }, [dispatch, rtmChannel])

   /**
    * Resets streaming state on component unmount.
    *
    * Ensures that the streaming state is reset to its initial values when the component is unmounted,
    * clearing any residual data such as view count, audio levels, and connection states for both RTC and RTM clients.
    */
   useEffect(() => {
      return () => {
         dispatch(setViewCount(0))
         dispatch(setAudioLevels([]))
         dispatch(setRTMConnectionState(null))
         dispatch(setRTCConnectionState(null))
      }
   }, [dispatch])

   return null
}
