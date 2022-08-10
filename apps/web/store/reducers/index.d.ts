import { DefaultRootState } from "react-redux"
import { RTCConnectionState, RTCError, StreamData } from "../../types/streaming"
import { FirebaseReducer, FirestoreReducer } from "react-redux-firebase"
import { HandRaise } from "../../types/handraise"

interface AuthReducer {
   error: null | string
   loading: boolean
   verifyEmail: {
      error: null | string
      loading: boolean
   }
   recoverPassword: {
      error: null | string
      loading: boolean
   }
   profileEdit: {
      error: null | string
      loading: boolean
   }
   deleteUser: {
      loading: boolean
      error: null | string
   }
}

interface StreamReducer {
   layout: {
      streamerBreakoutRoomModalOpen: boolean
      viewerBreakoutRoomModalOpen: boolean
      viewerCtaModalOpen: boolean
      leftMenuOpen: boolean
      focusModeEnabled: boolean
   }
   stats: {
      numberOfViewers: number
   }
   streaming: {
      isPublished: boolean
      videoIsPaused: boolean
      videoIsMuted: boolean
      playAllRemoteVideos: boolean
      muteAllRemoteVideos: boolean
      playLocalVideo: boolean
      playLocalAudio: boolean
      unmuteFailedMutedRemoteVideos: boolean
      unpauseFailedPlayRemoteVideos: boolean
      spyModeEnabled: boolean
   }
   agoraState: {
      rtcConnectionState?: RTCConnectionState
      rtcError?: RTCError
      sessionIsUsingCloudProxy: boolean
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

export interface GeneralLayoutState {
   layout: {
      drawerOpen: boolean
      isOnLandingPage: boolean
   }
}

// Optional: You can define the schema of your Firebase Redux store.
// This will give you type-checking for state.firebase.data.livestreams and state.firebase.ordered.livestreams
interface Schema {
   livestreams: StreamData
   handRaises: HandRaise
}

export default interface RootState extends DefaultRootState {
   generalLayout: GeneralLayoutState
   auth: AuthReducer
   stream: StreamReducer
   firebase: FirebaseReducer.Reducer<{}, Schema>
   firestore: FirestoreReducer.Reducer<{}, Schema>
}
