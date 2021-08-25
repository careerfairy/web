import * as actions from './actionTypes';


// Toggle the open state of the streamer breakoutModal
export const openStreamerBreakoutModal = () => async (dispatch) => {
    dispatch({type: actions.OPEN_STREAMER_BREAKOUT_MODAL})
};

// Close the streamer breakoutModal
export const closeStreamerBreakoutModal = () => async (dispatch) => {
    dispatch({type: actions.CLOSE_STREAMER_BREAKOUT_MODAL})
};
// Toggle the open state of the viewer breakoutModal
export const openViewerBreakoutModal = () => async (dispatch) => {
    dispatch({type: actions.OPEN_VIEWER_BREAKOUT_MODAL})
};

// Close the viewer breakoutModal
export const closeViewerBreakoutModal = () => async (dispatch) => {
    dispatch({type: actions.CLOSE_VIEWER_BREAKOUT_MODAL})
};

// Toggle the open state of the viewer call to action modal
export const openViewerCtaModal = () => async (dispatch) => {
    dispatch({type: actions.OPEN_VIEWER_CTA_MODAL})
};

// Close the viewer call to action modal
export const closeViewerCtaModal = () => async (dispatch) => {
    dispatch({type: actions.CLOSE_VIEWER_CTA_MODAL})
};

// Close the streamer breakoutModal
/**
 * @param {number} numberOfViewers
 */
export const setNumberOfViewers = (numberOfViewers) => async (dispatch) => {
    dispatch({type: actions.SET_NUMBER_OF_VIEWERS, payload: numberOfViewers || 0})
};