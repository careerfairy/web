import * as actions from './actionTypes';
import {EMOTE_MESSAGE_TEXT_TYPE} from "../../components/util/constants";

// Send an emote through the channel reference in the store
export const createEmote = (emoteType) => async (dispatch, getState,
                                                 ) => {
    const {rtmChannel} = getState()
    try {
        dispatch({type: actions.SEND_EMOTE_START})
        const message = {
            textType: EMOTE_MESSAGE_TEXT_TYPE,
            emoteType: emoteType,
            timestamp: new Date().getTime()
        }
        const stringMsg = JSON.stringify(message)
        await rtmChannel.sendMessage({
            messageType: "TEXT",
            text: stringMsg
        })
        dispatch({type: actions.SEND_EMOTE_SUCCESS})
        return message
    } catch (e) {
        dispatch({type: actions.SEND_EMOTE_FAIL, payload: e});
        return e
    }
};

// set an emote received from the channel socket listener
export const setEmote = (emoteObj) => async (dispatch) => {
    console.log("-> emoteObj", emoteObj);
    const emoteData = JSON.parse(emoteObj.message)
    dispatch({
        type: actions.ADD_EMOTE,
        payload: {
            textType: EMOTE_MESSAGE_TYPE,
            timestamp: emoteData.timestamp,
            emoteType: emoteData.emoteType,
            memberId: emoteObj.memberId,
        }
    })
    return emoteData
};
