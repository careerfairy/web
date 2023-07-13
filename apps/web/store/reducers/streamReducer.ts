import { RTCConnectionState, RTCError } from "types/streaming"
import { AGORA_RTC_CONNECTION_STATE_CONNECTING } from "../../constants/agora"
import * as actions from "../actions/actionTypes"
import { Reducer } from "redux"

interface StreamReducer {
   layout: {
      streamerBreakoutRoomModalOpen: boolean
      viewerBreakoutRoomModalOpen: boolean
      viewerCtaModalOpen: boolean
      leftMenuOpen: boolean
      focusModeEnabled: boolean
      animateProfileIcons: boolean
      showActionButtons: boolean
   }
   stats: {
      numberOfViewers: number
   }
   streaming: {
      isPublished: boolean
      videoIsPaused: boolean
      videoIsMuted: boolean
      muteAllRemoteVideos: boolean
      playLocalVideo: boolean
      playLocalAudio: boolean
      unmuteFailedMutedRemoteVideos: boolean
      unpauseFailedPlayRemoteVideos: boolean
      spyModeEnabled: boolean
   }
   videoOptions: {
      isBlurEnabled: boolean
      isBlurLoading: boolean
      hasErrored: boolean
      backgroundImage: string | undefined
      isBackgroundImageLoading: boolean
   }
   agoraState: {
      rtcConnectionState?: RTCConnectionState
      rtcError?: RTCError
      // The rtc client is successfully connected with the cloud proxy
      sessionIsUsingCloudProxy: boolean
      // rtm probably has firewall issues
      sessionRTMFailedToJoin: boolean
      primaryClientJoined: boolean
      screenSharePermissionDenied: boolean
      deviceErrors: {
         cameraDenied: boolean
         microphoneDenied: boolean
         cameraIsUsedByOtherApp: boolean
         microphoneIsUsedByOtherApp: boolean
      }
   }
}

const initialState: StreamReducer = {
   layout: {
      streamerBreakoutRoomModalOpen: false,
      viewerBreakoutRoomModalOpen: false,
      viewerCtaModalOpen: false,
      leftMenuOpen: true,
      focusModeEnabled: false,
      animateProfileIcons: false,
      showActionButtons: true,
   },
   stats: {
      numberOfViewers: 0,
   },
   streaming: {
      isPublished: false,
      videoIsPaused: false,
      videoIsMuted: false,
      muteAllRemoteVideos: false,
      playLocalVideo: true,
      playLocalAudio: true,
      unmuteFailedMutedRemoteVideos: false,
      unpauseFailedPlayRemoteVideos: false,
      spyModeEnabled: false,
   },
   videoOptions: {
      isBlurEnabled: false,
      isBlurLoading: false,
      hasErrored: false,
      backgroundImage: undefined,
      isBackgroundImageLoading: false,
   },
   agoraState: {
      rtcConnectionState: {
         // curState: undefined,
         curState: AGORA_RTC_CONNECTION_STATE_CONNECTING,
         prevState: undefined,
         reason: undefined,
         warning: undefined,
      },
      rtcError: {
         code: undefined,
         message: undefined,
         name: undefined,
         data: undefined,
         cause: undefined,
         stack: undefined,
      },
      deviceErrors: {
         cameraDenied: false,
         microphoneDenied: false,
         cameraIsUsedByOtherApp: false,
         microphoneIsUsedByOtherApp: false,
      },
      screenSharePermissionDenied: false,
      sessionIsUsingCloudProxy: false,
      sessionRTMFailedToJoin: false,
      primaryClientJoined: false,
   },
}

const streamReducer: Reducer<StreamReducer> = (
   state = initialState,
   { type, payload }
) => {
   switch (type) {
      case actions.SET_STREAMER_PUBLISHED:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               isPublished: payload,
            },
         }
      case actions.SET_SPY_MODE:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               spyModeEnabled: payload,
            },
         }
      case actions.SET_FOCUS_MODE:
         return {
            ...state,
            layout: {
               ...state.layout,
               focusModeEnabled: payload,
            },
         }
      case actions.ANIMATE_PROFILE_ICON:
         return {
            ...state,
            layout: {
               ...state.layout,
               animateProfileIcons: payload,
            },
         }
      case actions.SET_AGORA_RTC_CONNECTION_STATE:
         return {
            ...state,
            agoraState: {
               ...state.agoraState,
               rtcConnectionState: payload,
            },
         }
      case actions.SET_AGORA_RTC_ERROR:
         return {
            ...state,
            agoraState: {
               ...state.agoraState,
               rtcError: payload,
            },
         }
      case actions.SET_SESSION_IS_USING_CLOUD_PROXY:
         return {
            ...state,
            agoraState: {
               ...state.agoraState,
               sessionIsUsingCloudProxy: payload,
            },
         }
      case actions.SET_SESSION_RTM_FAILED_TO_JOIN:
         return {
            ...state,
            agoraState: {
               ...state.agoraState,
               sessionRTMFailedToJoin: payload,
            },
         }

      case actions.CLEAR_AGORA_RTC_ERROR:
         return {
            ...state,
            agoraState: {
               ...state.agoraState,
               rtcError: initialState.agoraState.rtcError,
            },
         }
      case actions.TOGGLE_LEFT_MENU:
         return {
            ...state,
            layout: {
               ...state.layout,
               leftMenuOpen: !state.layout.leftMenuOpen,
            },
         }
      case actions.OPEN_LEFT_MENU:
         return {
            ...state,
            layout: {
               ...state.layout,
               leftMenuOpen: true,
            },
         }
      case actions.CLOSE_LEFT_MENU:
         return {
            ...state,
            layout: {
               ...state.layout,
               leftMenuOpen: false,
            },
         }
      case actions.SET_DEVICE_ERROR:
         return {
            ...state,
            agoraState: {
               ...state.agoraState,
               deviceErrors: {
                  ...state.agoraState.deviceErrors,
                  ...payload,
               },
            },
         }
      case actions.SET_VIDEO_BLUR_START:
         return {
            ...state,
            videoOptions: {
               ...state.videoOptions,
               isBlurLoading: true,
               isBlurEnabled: false,
               backgroundImage: undefined,
               isBackgroundImageLoading: false,
            },
         }
      case actions.SET_VIDEO_BLUR_ENABLED:
         return {
            ...state,
            videoOptions: {
               ...state.videoOptions,
               isBlurLoading: false,
               isBlurEnabled: true,
               backgroundImage: undefined,
               isBackgroundImageLoading: false,
            },
         }
      case actions.SET_VIDEO_EFFECTS_OFF:
         return {
            ...state,
            videoOptions: {
               ...state.videoOptions,
               isBlurLoading: false,
               isBlurEnabled: false,
               backgroundImage: undefined,
               isBackgroundImageLoading: false,
            },
         }
      case actions.SET_VIDEO_EFFECTS_ERROR:
         return {
            ...state,
            videoOptions: {
               ...state.videoOptions,
               isBlurLoading: false,
               isBlurEnabled: false,
               backgroundImage: undefined,
               isBackgroundImageLoading: false,
               hasErrored: true,
            },
         }
      case actions.SET_VIDEO_BACKGROUND_IMAGE:
         return {
            ...state,
            videoOptions: {
               ...state.videoOptions,
               isBlurLoading: false,
               isBlurEnabled: false,
               backgroundImage: payload,
               isBackgroundImageLoading: true,
            },
         }
      case actions.SET_VIDEO_BACKGROUND_IMAGE_ENABLED:
         return {
            ...state,
            videoOptions: {
               ...state.videoOptions,
               isBlurLoading: false,
               isBlurEnabled: false,
               hasErrored: false,
               isBackgroundImageLoading: false,
            },
         }
      case actions.SET_SCREEN_SHARE_DENIED_ERROR:
         return {
            ...state,
            agoraState: {
               ...state.agoraState,
               screenSharePermissionDenied: payload,
            },
         }
      case actions.SET_AGORA_PRIMARY_CLIENT_JOINED:
         return {
            ...state,
            agoraState: {
               ...state.agoraState,
               primaryClientJoined: payload,
            },
         }
      case actions.TOGGLE_LOCAL_VIDEO:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               playLocalVideo: !state.streaming.playLocalVideo,
            },
         }
      case actions.TOGGLE_LOCAL_AUDIO:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               playLocalAudio: !state.streaming.playLocalAudio,
            },
         }
      case actions.MUTE_ALL_REMOTE_VIDEOS:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               muteAllRemoteVideos: true,
            },
         }
      case actions.UNMUTE_MUTED_REMOTE_VIDEOS_ON_FAIL:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               unmuteFailedMutedRemoteVideos: true,
               videoIsMuted: false,
            },
         }
      case actions.UNPAUSE_PAUSED_REMOTE_VIDEOS_ON_FAIL:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               unpauseFailedPlayRemoteVideos: true,
               videoIsPaused: false,
            },
         }
      case actions.UNMUTE_ALL_REMOTE_VIDEOS:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               videoIsMuted: false,
               muteAllRemoteVideos: false,
            },
         }
      case actions.SET_VIDEO_IS_MUTED:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               videoIsMuted: true,
               unmuteFailedMutedRemoteVideos: false,
            },
         }
      case actions.SET_VIDEO_IS_PAUSED:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               videoIsPaused: true,
               unpauseFailedPlayRemoteVideos: false,
            },
         }
      case actions.OPEN_STREAMER_BREAKOUT_MODAL:
         return {
            ...state,
            layout: { ...state.layout, streamerBreakoutRoomModalOpen: true },
         }
      case actions.CLOSE_STREAMER_BREAKOUT_MODAL:
         return {
            ...state,
            layout: { ...state.layout, streamerBreakoutRoomModalOpen: false },
         }
      case actions.OPEN_VIEWER_BREAKOUT_MODAL:
         return {
            ...state,
            layout: { ...state.layout, viewerBreakoutRoomModalOpen: true },
         }
      case actions.CLOSE_VIEWER_BREAKOUT_MODAL:
         return {
            ...state,
            layout: { ...state.layout, viewerBreakoutRoomModalOpen: false },
         }
      case actions.OPEN_VIEWER_CTA_MODAL:
         return {
            ...state,
            layout: { ...state.layout, viewerCtaModalOpen: true },
         }
      case actions.CLOSE_VIEWER_CTA_MODAL:
         return {
            ...state,
            layout: { ...state.layout, viewerCtaModalOpen: false },
         }
      case actions.SET_NUMBER_OF_VIEWERS:
         return {
            ...state,
            stats: { ...state.stats, numberOfViewers: payload },
         }
      case actions.HIDE_ACTION_BUTTONS:
         return {
            ...state,
            layout: { ...state.layout, showActionButtons: false },
         }
      case actions.SHOW_ACTION_BUTTONS:
         return {
            ...state,
            layout: { ...state.layout, showActionButtons: true },
         }
      default:
         return state
   }
}

export default streamReducer
