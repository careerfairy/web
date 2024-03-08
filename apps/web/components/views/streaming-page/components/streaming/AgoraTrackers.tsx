import AgoraRTC, { useClientEvent, useRTCClient } from "agora-rtc-react"
import { useAppDispatch } from "components/custom-hook/store"
import { useEffect } from "react"
import { setAudioLevels } from "store/reducers/streamingAppReducer"

export const AgoraTrackers = () => {
   const client = useRTCClient()
   const dispatch = useAppDispatch()

   /**
    * A hook that tracks and dispatches the audio levels of users in a streaming session.
    *
    * It listens for the "volume-indicator" event from the Agora RTC client,
    * which provides the audio levels of users. These levels are then dispatched to the Redux store
    * using the `setAudioLevels` action.
    */
   useClientEvent(client, "volume-indicator", (users) => {
      dispatch(setAudioLevels(users))
   })

   useEffect(() => {
      AgoraRTC.onAutoplayFailed = () => {
         // TODO: Handle autoplay failure
         // ticket: https://linear.app/careerfairy/issue/CF-816/handle-videoaudio-track-autoplay-faliure
      }
   }, [client])

   return null
}
