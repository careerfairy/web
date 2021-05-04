import * as actions from './actionTypes';

// Set the Channel
export const setRtmClientObj = (channel) => async (dispatch) => {
    dispatch({
        type: actions.SET_RTM_CLIENT,
        payload: channel
    });
};

// Remove the Channel
export const removeRtmClient = () => async (
    dispatch,
) => {
    dispatch({type: actions.REMOVE_RTM_CLIENT});
};
