import * as actions from "../actions/actionTypes";

const initialState = {
   layout: {
      streamerBreakoutRoomModalOpen: false,
      viewerBreakoutRoomModalOpen: false,
      viewerCtaModalOpen: false,
      videoPaused: false,
      videoMuted: false,
   },
   stats: {
      numberOfViewers: 0,
   },
   streaming: {
      videoIsPaused: false,
      videoIsMuted: false,
      playAllRemoteVideos: false,
      muteAllRemoteVideos: false,
      playLocalVideo: true,
      playLocalAudio: true,
      unmuteFailedMutedRemoteVideos: false,
      unpauseFailedPlayRemoteVideos: false
   },
};

const streamReducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case actions.TOGGLE_LOCAL_VIDEO:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               playLocalVideo: !state.streaming.playLocalVideo,
            },
         };
      case actions.TOGGLE_LOCAL_AUDIO:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               playLocalAudio: !state.streaming.playLocalAudio,
            },
         };
      case actions.MUTE_ALL_REMOTE_VIDEOS:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               muteAllRemoteVideos: true,
            },
         };
      case actions.UNMUTE_MUTED_REMOTE_VIDEOS_ON_FAIL:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               unmuteFailedMutedRemoteVideos: true,
               videoIsMuted: true,
            },
         };
      case actions.UNPAUSE_PAUSED_REMOTE_VIDEOS_ON_FAIL:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               unpauseFailedPlayRemoteVideos: true,
               videoIsPaused: true,
            },
         };
      case actions.UNMUTE_ALL_REMOTE_VIDEOS:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               videoIsMuted: false,
               muteAllRemoteVideos: false
            },
         };
      case actions.SET_VIDEO_IS_MUTED:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               videoIsMuted: true,
               unmuteFailedMutedRemoteVideos: false
            },
         };
      case actions.SET_VIDEO_IS_PAUSED:
         return {
            ...state,
            streaming: {
               ...state.streaming,
               videoIsPaused: true,
               unpauseFailedPlayRemoteVideos: false
            },
         };
      case actions.OPEN_STREAMER_BREAKOUT_MODAL:
         return {
            ...state,
            layout: { ...state.layout, streamerBreakoutRoomModalOpen: true },
         };
      case actions.CLOSE_STREAMER_BREAKOUT_MODAL:
         return {
            ...state,
            layout: { ...state.layout, streamerBreakoutRoomModalOpen: false },
         };
      case actions.OPEN_VIEWER_BREAKOUT_MODAL:
         return {
            ...state,
            layout: { ...state.layout, viewerBreakoutRoomModalOpen: true },
         };
      case actions.CLOSE_VIEWER_BREAKOUT_MODAL:
         return {
            ...state,
            layout: { ...state.layout, viewerBreakoutRoomModalOpen: false },
         };
      case actions.OPEN_VIEWER_CTA_MODAL:
         return {
            ...state,
            layout: { ...state.layout, viewerCtaModalOpen: true },
         };
      case actions.CLOSE_VIEWER_CTA_MODAL:
         return {
            ...state,
            layout: { ...state.layout, viewerCtaModalOpen: false },
         };
      case actions.SET_NUMBER_OF_VIEWERS:
         return {
            ...state,
            stats: { ...state.stats, numberOfViewers: payload },
         };
      default:
         return state;
   }
};

export default streamReducer;
