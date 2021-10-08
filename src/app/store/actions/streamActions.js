import * as actions from "./actionTypes";

// Toggle the open state of the streamer breakoutModal
export const openStreamerBreakoutModal = () => async (dispatch) => {
   dispatch({ type: actions.OPEN_STREAMER_BREAKOUT_MODAL });
};

// Close the streamer breakoutModal
export const closeStreamerBreakoutModal = () => async (dispatch) => {
   dispatch({ type: actions.CLOSE_STREAMER_BREAKOUT_MODAL });
};
// Toggle the open state of the viewer breakoutModal
export const openViewerBreakoutModal = () => async (dispatch) => {
   dispatch({ type: actions.OPEN_VIEWER_BREAKOUT_MODAL });
};

// Close the viewer breakoutModal
export const closeViewerBreakoutModal = () => async (dispatch) => {
   dispatch({ type: actions.CLOSE_VIEWER_BREAKOUT_MODAL });
};

// Toggle the open state of the viewer call to action modal
export const openViewerCtaModal = () => async (dispatch) => {
   dispatch({ type: actions.OPEN_VIEWER_CTA_MODAL });
};

// Close the viewer call to action modal
export const closeViewerCtaModal = () => async (dispatch) => {
   dispatch({ type: actions.CLOSE_VIEWER_CTA_MODAL });
};

// Close the streamer breakoutModal
/**
 * @param {number} numberOfViewers
 */
export const setNumberOfViewers = (numberOfViewers) => async (dispatch) => {
   dispatch({
      type: actions.SET_NUMBER_OF_VIEWERS,
      payload: numberOfViewers || 0,
   });
};

// Toggle your local video
export const toggleLocalVideo = () => async (dispatch) => {
   dispatch({ type: actions.TOGGLE_LOCAL_VIDEO });
};

// Toggle your local audio
export const toggleLocalAudio = () => async (dispatch) => {
   dispatch({ type: actions.TOGGLE_LOCAL_AUDIO });
};

// Mute All videos on the stream
export const muteAllRemoteVideos = () => async (dispatch) => {
   dispatch({ type: actions.MUTE_ALL_REMOTE_VIDEOS });
};

// Unmute All videos on the stream
export const unmuteAllRemoteVideos = () => async (dispatch) => {
   dispatch({ type: actions.UNMUTE_ALL_REMOTE_VIDEOS });
};

// If the error returned from playing a video is audio related let the app know that a video is muted
export const setVideoIsMuted = () => async (dispatch) => {
   dispatch({ type: actions.SET_VIDEO_IS_MUTED });
};

// If the error returned from playing a video is that its not playing, let the app know that the video is paused
export const setVideoIsPaused = () => async (dispatch) => {
   dispatch({ type: actions.SET_VIDEO_IS_PAUSED });
};

// iF A STREAM FAILS TO PLAY AUDIO TRY TO UNMUTE ALL OF THEM
export const unmuteMutedRemoteVideosAfterFail = () => async (dispatch) => {
   dispatch({ type: actions.UNMUTE_MUTED_REMOTE_VIDEOS_ON_FAIL });
};
// iF A STREAM FAILS TO PLAY AUDIO TRY TO UNMUTE ALL OF THEM
export const unpauseRemoteVideosAfterFail = () => async (dispatch) => {
   dispatch({ type: actions.UNPAUSE_PAUSED_REMOTE_VIDEOS_ON_FAIL });
};

// Action to hide the left menu on stream UI
export const openLeftMenu = () => async (dispatch) => {
   dispatch({ type: actions.OPEN_LEFT_MENU });
};

// Action to show the left menu on stream UI
export const closeLeftMenu = () => async (dispatch) => {
   dispatch({ type: actions.CLOSE_LEFT_MENU });
};

// Action to toggle the open state of the left menu on stream UI
export const toggleLeftMenu = () => async (dispatch) => {
   dispatch({ type: actions.TOGGLE_LEFT_MENU });
};

export const setFocusMode = (mode, mobile) => async (dispatch, getState) => {
   // If mode is null or undefined, the new mode will be the opposite of the current mode
   const newFocusMode = Boolean(
      mode ?? !getState().stream.layout.focusModeEnabled
   );

   dispatch({
      type: actions.SET_FOCUS_MODE,
      payload: Boolean(newFocusMode),
   });
   if (newFocusMode) {
      return dispatch(closeLeftMenu());
   } else {
      if (!mobile) {
         return dispatch(openLeftMenu());
      }
   }
};
