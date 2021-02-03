import * as actions from './actionTypes';
import {EMOTE_MESSAGE_TEXT_TYPE} from "../../components/util/constants";

const tempId = new Date().getTime()
const buildEmoteAction = (message, memberId) => {
    return {
        type: actions.ADD_EMOTE,
        payload: {
            textType: EMOTE_MESSAGE_TEXT_TYPE,
            timestamp: message.timestamp,
            emoteType: message.emoteType,
            memberId: memberId,
        }
    }
}
// Send an emote through the channel reference in the store
export const createEmote = (emoteType) => async (dispatch, getState,
) => {
    const {rtmChannel, firebase: {auth}} = getState()
    const memberId = auth.id || tempId

    try {
        dispatch({type: actions.SEND_EMOTE_START})
        const message = {
            textType: EMOTE_MESSAGE_TEXT_TYPE,
            emoteType: emoteType,
            timestamp: new Date().getTime()
        }
        dispatch(setEmote(message, memberId))
        const stringMsg = JSON.stringify(message)
        await rtmChannel.sendMessage({
            messageType: "TEXT",
            text: stringMsg
        })
        dispatch({type: actions.SEND_EMOTE_SUCCESS})
    } catch (e) {
        dispatch({type: actions.SEND_EMOTE_FAIL, payload: e});
        return e
    }
};

// set an emote received from the channel socket listener
export const setEmote = (message, memberId) => async (dispatch) => {
    const emoteAction = buildEmoteAction(message, memberId)
    dispatch(emoteAction)
    return emoteAction
};
