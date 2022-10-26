import * as actions from "./actionTypes"
import { RTCConnectionState, RTCError } from "../../types/streaming"
import * as actionMethods from "./index"

// Toggle the open state of the streamer breakoutModal
export const openStreamerBreakoutModal = () => async (dispatch) => {
   dispatch({ type: actions.OPEN_STREAMER_BREAKOUT_MODAL })
}

// Close the streamer breakoutModal
export const closeStreamerBreakoutModal = () => async (dispatch) => {
   dispatch({ type: actions.CLOSE_STREAMER_BREAKOUT_MODAL })
}
// Toggle the open state of the viewer breakoutModal
export const openViewerBreakoutModal = () => async (dispatch) => {
   dispatch({ type: actions.OPEN_VIEWER_BREAKOUT_MODAL })
}

// Close the viewer breakoutModal
export const closeViewerBreakoutModal = () => async (dispatch) => {
   dispatch({ type: actions.CLOSE_VIEWER_BREAKOUT_MODAL })
}

// Toggle the open state of the viewer call to action modal
export const openViewerCtaModal = () => async (dispatch) => {
   dispatch({ type: actions.OPEN_VIEWER_CTA_MODAL })
}

// Close the viewer call to action modal
export const closeViewerCtaModal = () => async (dispatch) => {
   dispatch({ type: actions.CLOSE_VIEWER_CTA_MODAL })
}

// Close the streamer breakoutModal
/**
 * @param {number} numberOfViewers
 */
export const setNumberOfViewers = (numberOfViewers) => async (dispatch) => {
   dispatch({
      type: actions.SET_NUMBER_OF_VIEWERS,
      payload: numberOfViewers || 0,
   })
}

// Mute All videos on the stream
export const muteAllRemoteVideos = () => async (dispatch) => {
   dispatch({ type: actions.MUTE_ALL_REMOTE_VIDEOS })
}

// Unmute All videos on the stream
export const unmuteAllRemoteVideos = () => async (dispatch) => {
   dispatch({ type: actions.UNMUTE_ALL_REMOTE_VIDEOS })
}

// If the error returned from playing a video is audio related let the app know that a video is muted
export const setVideoIsMuted = () => async (dispatch) => {
   dispatch({ type: actions.SET_VIDEO_IS_MUTED })
}

// If the error returned from playing a video is that its not playing, let the app know that the video is paused
export const setVideoIsPaused = () => async (dispatch) => {
   dispatch({ type: actions.SET_VIDEO_IS_PAUSED })
}

// iF A STREAM FAILS TO PLAY AUDIO TRY TO UNMUTE ALL OF THEM
export const unmuteMutedRemoteVideosAfterFail = () => async (dispatch) => {
   dispatch({ type: actions.UNMUTE_MUTED_REMOTE_VIDEOS_ON_FAIL })
}
// iF A STREAM FAILS TO PLAY AUDIO TRY TO UNMUTE ALL OF THEM
export const unpauseRemoteVideosAfterFail = () => async (dispatch) => {
   dispatch({ type: actions.UNPAUSE_PAUSED_REMOTE_VIDEOS_ON_FAIL })
}

// Action to hide the left menu on stream UI
export const openLeftMenu = () => async (dispatch) => {
   dispatch({ type: actions.OPEN_LEFT_MENU })
}

// Action to show the left menu on stream UI
export const closeLeftMenu = () => async (dispatch) => {
   dispatch({ type: actions.CLOSE_LEFT_MENU })
}

// Action to toggle the open state of the left menu on stream UI
export const toggleLeftMenu = () => async (dispatch) => {
   dispatch({ type: actions.TOGGLE_LEFT_MENU })
}

// Animate the Profile icon on the speaker details overlay
export const animateProfileIcon = () => async (dispatch) => {
   dispatch({ type: actions.ANIMATE_PROFILE_ICON, payload: true })
}

// Action to show the actions buttons on stream UI
export const showActionButtons = () => async (dispatch) => {
   dispatch({ type: actions.SHOW_ACTION_BUTTONS })
}

// Action to hide the actions buttons on stream UI
export const hideActionButtons = () => async (dispatch) => {
   dispatch({ type: actions.HIDE_ACTION_BUTTONS })
}

export const setFocusMode = (mode, mobile) => async (dispatch, getState) => {
   // If mode is null or undefined, the new mode will be the opposite of the current mode
   const newFocusMode = Boolean(
      mode ?? !getState().stream.layout.focusModeEnabled
   )

   dispatch({
      type: actions.SET_FOCUS_MODE,
      payload: Boolean(newFocusMode),
   })

   dispatch({ type: actions.CLEAR_ALL_EMOTES })
   if (newFocusMode) {
      return dispatch(closeLeftMenu())
   } else {
      if (!mobile) {
         return dispatch(openLeftMenu())
      }
   }
}

export const setAgoraRtcConnectionState =
   (connectionState: RTCConnectionState) => async (dispatch) => {
      dispatch({
         type: actions.SET_AGORA_RTC_CONNECTION_STATE,
         payload: connectionState,
      })
   }

export const setAgoraRtcError = (rtcError: RTCError) => async (dispatch) => {
   dispatch({
      type: actions.SET_AGORA_RTC_ERROR,
      payload: rtcError,
   })
}

export const handleSetMicrophoneDenied =
   (denied: boolean) => async (dispatch) => {
      dispatch(setDeviceError("microphoneDenied", denied))
   }
export const handleSetCameraDenied = (denied: boolean) => async (dispatch) => {
   dispatch(setDeviceError("cameraDenied", denied))
}
export const handleSetMicIsInUse = (isInUse: boolean) => async (dispatch) => {
   dispatch(setDeviceError("microphoneIsUsedByOtherApp", isInUse))
}
export const handleSetCamIsInUse = (isInUse: boolean) => async (dispatch) => {
   dispatch(setDeviceError("cameraIsUsedByOtherApp", isInUse))
}
type DeviceErrorType =
   | "cameraIsUsedByOtherApp"
   | "microphoneIsUsedByOtherApp"
   | "cameraDenied"
   | "microphoneDenied"

export const setDeviceError =
   (deviceErrorType: DeviceErrorType, isTrue: boolean) => async (dispatch) => {
      dispatch({
         type: actions.SET_DEVICE_ERROR,
         payload: { [deviceErrorType]: isTrue },
      })
   }

export const setScreenShareDeniedError = (denied: boolean) => (dispatch) => {
   return dispatch({
      type: actions.SET_SCREEN_SHARE_DENIED_ERROR,
      payload: denied,
   })
}
export const handleScreenShareDeniedError =
   (error: RTCError) => async (dispatch) => {
      const errorMessage = error?.message?.toLowerCase?.()
      switch (error?.code) {
         case "PERMISSION_DENIED":
            if (errorMessage?.includes("permission denied by system")) {
               dispatch(setScreenShareDeniedError(true))
            } else if (errorMessage?.includes("permission denied")) {
            }
            break
         case "NOT_READABLE":
            if (
               errorMessage
                  ?.toLowerCase()
                  .includes("could not start video source")
            ) {
               dispatch(setScreenShareDeniedError(true))
            }
            break
         case "DEVICE_NOT_FOUND":
            dispatch(setScreenShareDeniedError(true))
            break
         case "SHARE_AUDIO_NOT_ALLOWED":
            break
         default:
            break
      }
   }

export const setAgoraPrimaryClientJoined =
   (hasJoined: boolean) => (dispatch) => {
      dispatch({
         type: actions.SET_AGORA_PRIMARY_CLIENT_JOINED,
         payload: hasJoined,
      })
   }

export const handleClearDeviceError =
   (deviceErrorType: DeviceErrorType) => (dispatch) => {
      return dispatch(setDeviceError(deviceErrorType, false))
   }
export const handleSetDeviceError =
   (error: RTCError, deviceType: "microphone" | "camera") => (dispatch) => {
      if (error?.code === "UNEXPECTED_ERROR") {
         dispatch(actionMethods.sendGeneralError(error))
      }
      if (error?.code === "PERMISSION_DENIED") {
         switch (deviceType) {
            case "camera":
               dispatch(handleSetCameraDenied(true))
               break
            case "microphone":
               dispatch(handleSetMicrophoneDenied(true))
               break
         }
      }
      if (error?.code === "NOT_READABLE") {
         switch (deviceType) {
            case "camera":
               dispatch(handleSetCamIsInUse(true))
               break
            case "microphone":
               dispatch(handleSetMicIsInUse(true))
               break
         }
      }
   }
export const clearAgoraRtcError = () => async (dispatch) => {
   dispatch({
      type: actions.CLEAR_AGORA_RTC_ERROR,
   })
}
export const setSessionIsUsingCloudProxy =
   (isUsing: boolean) => async (dispatch) => {
      dispatch({
         type: actions.SET_SESSION_IS_USING_CLOUD_PROXY,
         payload: isUsing,
      })
   }
export const setSessionShouldUseCloudProxy =
   (isUsing: boolean) => async (dispatch) => {
      dispatch({
         type: actions.SET_SESSION_SHOULD_USE_CLOUD_PROXY,
         payload: isUsing,
      })
   }

// Action to set streamer state, this is to prevent feature hints to show up before the streamer has published
export const setStreamerIsPublished = (isPublished) => async (dispatch) => {
   dispatch({
      type: actions.SET_STREAMER_PUBLISHED,
      payload: isPublished,
   })
}
// Action to show the left menu on stream UI
export const setSpyMode = (mode) => async (dispatch, getState) => {
   // if mode is undefined or null, it will perform a toggle
   const newSpyMode = Boolean(
      mode ?? !getState().stream.streaming.spyModeEnabled
   )
   dispatch({ type: actions.SET_SPY_MODE, payload: Boolean(newSpyMode) })
}
