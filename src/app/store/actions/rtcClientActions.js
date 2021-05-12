import * as actions from './actionTypes';

// Set the Channel
export const setRtcClientObj = (channel) => async (dispatch) => {
    dispatch({
        type: actions.SET_RTC_CLIENT,
        payload: channel
    });
};

// Remove the Channel
export const removeRtcClient = () => async (
    dispatch,
) => {
    dispatch({type: actions.REMOVE_RTC_CLIENT});
};
