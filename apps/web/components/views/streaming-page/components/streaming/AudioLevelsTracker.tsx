import { useClientEvent, useRTCClient } from "agora-rtc-react"
import { useAppDispatch } from "components/custom-hook/store"
import { setAudioLevels } from "store/reducers/streamingAppReducer"

/**
 * Tracks and dispatches audio levels of users in a streaming session.
 *
 * This component listens for the "volume-indicator" event from the Agora RTC client,
 * which provides the audio levels of users. It then dispatches these levels to the Redux store
 * using the `setAudioLevels` action.
 *
 * @returns {null} This component does not render anything.
 */
export const AudioLevelsTracker = () => {
   const client = useRTCClient()
   const dispatch = useAppDispatch()

   useClientEvent(client, "volume-indicator", (users) => {
      dispatch(setAudioLevels(users))
   })

   return null
}
