import * as actions from "./actionTypes";
import { RTCConnectionState, RTCError } from "../../types/streaming";

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

   dispatch({ type: actions.CLEAR_ALL_EMOTES });
   if (newFocusMode) {
      return dispatch(closeLeftMenu());
   } else {
      if (!mobile) {
         return dispatch(openLeftMenu());
      }
   }
};

export const setAgoraRtcConnectionState = (
   connectionState: RTCConnectionState
) => async (dispatch) => {
   dispatch({
      type: actions.SET_AGORA_RTC_CONNECTION_STATE,
      payload: connectionState,
   });
};

export const setAgoraRtcError = (rtcError: RTCError) => async (dispatch) => {
   dispatch({
      type: actions.SET_AGORA_RTC_ERROR,
      payload: rtcError,
   });
};
export const clearAgoraRtcError = () => async (dispatch) => {
   dispatch({
      type: actions.CLEAR_AGORA_RTC_ERROR,
   });
};
export const setSessionIsUsingCloudProxy = (isUsing: boolean) => async (
   dispatch
) => {
   dispatch({
      type: actions.SET_SESSION_IS_USING_CLOUD_PROXY,
      payload: isUsing,
   });
};

// Action to set streamer state, this is to prevent feature hints to show up before the streamer has published
export const setStreamerIsPublished = (isPublished) => async (dispatch) => {
   dispatch({
      type: actions.SET_STREAMER_PUBLISHED,
      payload: isPublished,
   });
};
// Action to show the left menu on stream UI
export const setSpyMode = (mode) => async (dispatch, getState) => {
   // if mode is undefined or null, it will perform a toggle
   const newSpyMode = Boolean(
      mode ?? !getState().stream.streaming.spyModeEnabled
   );
   dispatch({ type: actions.SET_SPY_MODE, payload: Boolean(newSpyMode) });
};
