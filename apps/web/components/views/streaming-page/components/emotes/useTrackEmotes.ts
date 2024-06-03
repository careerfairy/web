import { EmoteType } from "@careerfairy/shared-lib/livestreams"
import { useAppDispatch } from "components/custom-hook/store"
import { useWindowVisibility } from "components/custom-hook/utils/useWindowVisibility"
import { addEmote } from "store/reducers/streamingAppReducer"
import { useRTMChannel, useRTMChannelEvent } from "../../context/rtm"

/**
 * Custom hook to track emotes in a live stream.
 *
 * This hook listens for "ChannelMessage" events on the RTM channel and dispatches
 * valid emotes to the Redux store if the window is visible. It ensures that emotes
 * are only added when the window is in focus to prevent queue overflow.
 *
 */
export const useTrackEmotes = () => {
   const rtmChannel = useRTMChannel()

   const dispatch = useAppDispatch()

   const isWindowVisible = useWindowVisibility()

   useRTMChannelEvent(rtmChannel, "ChannelMessage", (message) => {
      if (message.messageType === "TEXT") {
         const isValidEmote = Object.values(EmoteType).includes(
            message.text as EmoteType
         )

         if (isValidEmote && isWindowVisible) {
            // prevent emote queue overflow when window is restored
            dispatch(addEmote(message.text as EmoteType))
         }
      }
   })
}
