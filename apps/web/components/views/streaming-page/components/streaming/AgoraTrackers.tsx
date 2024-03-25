import AgoraRTC, { useClientEvent, useRTCClient } from "agora-rtc-react"
import { useAppDispatch } from "components/custom-hook/store"
import { useEffect } from "react"
import {
   setAudioLevels,
   setRTMConnectionState,
   setViewCount,
} from "store/reducers/streamingAppReducer"
import {
   useRTMChannel,
   useRTMChannelEvent,
   useRTMClient,
   useRTMClientEvent,
} from "../../context/rtm"
import { useSnackbar } from "notistack"

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

   return null
}
