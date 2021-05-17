import * as actions from './actionTypes';


// Toggle the open state of the streamer breakoutModal
export const openStreamerBreakoutModal = () => async (dispatch) => {
    dispatch({type: actions.OPEN_STREAMER_BREAKOUT_MODAL})
};

// Close the streamer breakoutModal
export const closeStreamerBreakoutModal = () => async (dispatch) => {
    dispatch({type: actions.CLOSE_STREAMER_BREAKOUT_MODAL})
};