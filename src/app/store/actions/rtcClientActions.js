import * as actions from "./actionTypes";

// Set the Channel
export const setRtcClient = (client) => async (dispatch) => {
   dispatch({
      type: actions.SET_RTC_CLIENT,
      payload: client,
   });
};

// Remove the Channel
export const removeRtcClient = () => async (dispatch) => {
   dispatch({ type: actions.REMOVE_RTC_CLIENT });
};
