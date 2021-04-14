import * as actions from './actionTypes';


// Toggle the open state of he filter on next-livestreams
export const toggleNextLivestreamsFilter = () => async (dispatch) => {
    dispatch({type: actions.TOGGLE_NEXT_LIVESTREAMS_FILTER})
};

// Close the filter on next-livestreams
export const openNextLivestreamsFilter = () => async (dispatch) => {
    dispatch({type: actions.OPEN_NEXT_LIVESTREAMS_FILTER})
};
// Open the filter on next-livestreams
export const closeNextLivestreamsFilter = () => async (dispatch) => {
    dispatch({type: actions.CLOSE_NEXT_LIVESTREAMS_FILTER})
};