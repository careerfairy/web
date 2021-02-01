import * as actions from './actionTypes';

// Set the Channel
export const setRtmChannelObj = (channel) => async (dispatch) => {
    dispatch({
        type: actions.SET_RTM_CHANNEL,
        payload: channel
    });
};

// Remove the Channel
export const removeRtmChannel = () => async (
    dispatch,
) => {
    dispatch({type: actions.REMOVE_RTM_CHANNEL});
};
