import { RtmStatusCode } from "agora-rtm-sdk";
import { DefaultRootState } from "react-redux";

interface AuthReducer {
   error: null | string;
   loading: boolean;
   verifyEmail: {
      error: null | string;
      loading: boolean;
   };
   recoverPassword: {
      error: null | string;
      loading: boolean;
   };
   profileEdit: {
      error: null | string;
      loading: boolean;
   };
   deleteUser: {
      loading: boolean;
      error: null | string;
   };
}

interface StreamReducer {
   layout: {
      streamerBreakoutRoomModalOpen: boolean;
      viewerBreakoutRoomModalOpen: boolean;
      viewerCtaModalOpen: boolean;
      leftMenuOpen: boolean;
      focusModeEnabled: boolean;
   };
   stats: {
      numberOfViewers: number;
   };
   streaming: {
      isPublished: boolean;
      videoIsPaused: boolean;
      videoIsMuted: boolean;
      playAllRemoteVideos: boolean;
      muteAllRemoteVideos: boolean;
      playLocalVideo: boolean;
      playLocalAudio: boolean;
      unmuteFailedMutedRemoteVideos: boolean;
      unpauseFailedPlayRemoteVideos: boolean;
      spyModeEnabled: boolean;
   };
   agoraState: {
      rtcConnectionState: RtmStatusCode.ConnectionState;
      rtcError: null | string;
   };
}

export default interface RootState extends DefaultRootState {
   auth: AuthReducer;
   stream: StreamReducer;
}
