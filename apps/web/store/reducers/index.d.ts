import { DefaultRootState } from "react-redux"
import { RTCConnectionState, RTCError } from "../../types/streaming"
import { FirebaseReducer, FirestoreReducer } from "react-redux-firebase"
import { HandRaise } from "../../types/handraise"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"

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
      screenSharePermissionDenied: boolean
      deviceErrors: {
         cameraDenied: boolean
         microphoneDenied: boolean
         cameraIsUsedByOtherApp: boolean
         microphoneIsUsedByOtherApp: boolean
      }
   }
}

interface GroupAnalyticsReducer {
   streams: {
      fromTimeframeAndFuture: LivestreamEvent[]
   }
   hiddenStreamIds: Record<string, boolean>
   visibleStreamIds: string[]
}

interface UserDataSetReducer {
   total: {
      ordered: UserData[]
      mapped: Record<UserData["id"], UserData>
   }
   filtered: {
      ordered: UserData[]
      mapped: Record<UserData["id"], UserData>
   }
}

interface GeneralLayoutState {
   layout: {
      drawerOpen: boolean
   }
}

// Optional: You can define the schema of your Firebase Redux store.
// This will give you type-checking for state.firebase.data.livestreams and state.firebase.ordered.livestreams
interface Schema {
   livestreams: LivestreamEvent
   handRaises: HandRaise
}

export default interface RootState extends DefaultRootState {
   generalLayout: GeneralLayoutState
   auth: AuthReducer
   stream: StreamReducer
   firebase: FirebaseReducer.Reducer<{}, Schema>
   firestore: FirestoreReducer.Reducer<{}, Schema>
   analyticsReducer: GroupAnalyticsReducer
   userDataSet: UserDataSetReducer
}
