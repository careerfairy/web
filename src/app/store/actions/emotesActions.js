import * as actions from './actionTypes';



const setChannel = (channelObj) => {
    return {
        type: actions.SET_RTM_CHANNEL,
        payload: channelObj
    }
};

// Set the Channel
export const setRtmChannelObj = (channel) => async (dispatch) => {
    dispatch(setChannel(channel));
};

// Remove the Channel
export const removeRtmChannel = () => async (
    dispatch,
) => {
    dispatch({ type: actions.REMOVE_RTM_CHANNEL });
};
