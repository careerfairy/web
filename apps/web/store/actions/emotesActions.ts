import * as actions from "./actionTypes"
import { EMOTE_MESSAGE_TEXT_TYPE } from "../../components/util/constants"
import { isRecordingWindow } from "../../util/PathUtils"
import { EmoteEntity, EmoteMessage } from "context/agora/RTMContext"

const tempId = new Date().getTime()
const buildEmoteAction = (
   message: EmoteEntity,
   memberId: EmoteMessage["memberId"]
) => {
   return {
      type: actions.ADD_EMOTE,
      payload: {
         textType: EMOTE_MESSAGE_TEXT_TYPE,
         timestamp: message.timestamp,
         emoteType: message.emoteType,
         memberId: memberId,
      },
   }
}

// Send an emote through the channel reference in the store
export const createEmote =
   (emoteType: EmoteEntity["emoteType"]) => (dispatch, getState) => {
      const {
         firebase: { auth },
      } = getState()
      const memberId = auth.id || tempId

      try {
         dispatch({ type: actions.SEND_EMOTE_START })
         const message: EmoteEntity = {
            textType: EMOTE_MESSAGE_TEXT_TYPE,
            emoteType: emoteType,
            timestamp: new Date().getTime(),
         }
         dispatch(setEmote(message, memberId))
         const stringMsg = JSON.stringify(message)
         const messageToSend = {
            messageType: "TEXT",
            text: stringMsg,
         }
         // await rtmChannel.sendMessage()
         dispatch({ type: actions.SEND_EMOTE_SUCCESS })
         return messageToSend
      } catch (e) {
         dispatch({ type: actions.SEND_EMOTE_FAIL, payload: e })
         return e
      }
   }

// set an emote received from the channel socket listener
export const setEmote =
   (message: EmoteEntity, memberId: EmoteMessage["memberId"]) =>
   async (dispatch, getState) => {
      const focusModeEnabled = getState().stream.layout.focusModeEnabled
      // Don't bother sending or storing emotes in redux when focus mode is enabled
      if (focusModeEnabled && !isRecordingWindow()) return
      const emoteAction = buildEmoteAction(message, memberId)
      dispatch(emoteAction)
      return emoteAction
   }

export const clearAllEmotes = () => async (dispatch) => {
   return dispatch({
      type: actions.CLEAR_ALL_EMOTES,
   })
}
