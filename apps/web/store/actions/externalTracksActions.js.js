import * as actions from "./actionTypes"

// Set the Channel
export const setExternalTracks = (channel) => async (dispatch) => {
   dispatch({
      type: actions.SET_EXTERNAL_TRACKS,
      payload: channel,
   })
}

// Remove the Channel
export const removeExternalTracks = () => async (dispatch) => {
   dispatch({ type: actions.REMOVE_EXTERNAL_TRACKS })
}
