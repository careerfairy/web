import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   IAgoraRTCClient,
   ILocalAudioTrack,
   ILocalVideoTrack,
   NetworkQuality,
} from "agora-rtc-sdk-ng"
import React from "react"
import { IRemoteStream, LocalStream } from "../../types/streaming"

export interface RtcContextInterface {
   remoteStreams: IRemoteStream[]
   demoStreamHandlers: {
      removeDemoStream: () => void
      addDemoStream: () => void
   }
   screenShareRtcClient: IAgoraRTCClient
   unPublishScreenShareStream: () => Promise<void>
   handlePublishLocalStream: () => Promise<void>
   screenShareStreamRef: React.MutableRefObject<
      ILocalVideoTrack | [ILocalVideoTrack, ILocalAudioTrack]
   >
   closeAndUnpublishedLocalStream: () => Promise<void>
   rtcClient: IAgoraRTCClient
   localMediaHandlers: {
      closeLocalCameraTrack: () => Promise<void>
      initializeLocalVideoStream: () => Promise<void>
      closeLocalMicrophoneTrack: () => Promise<void>
      initializeLocalAudioStream: () => Promise<void>
   }
   publishLocalStreamTracks: {
      returnToAudience: () => Promise<void>
      publishLocalCameraTrack: () => Promise<void>
      publishLocalMicrophoneTrack: () => Promise<void>
   }
   localMediaControls: {
      setLocalVideoEnabled: (value) => Promise<void>
      setLocalAudioEnabled: (value) => Promise<void>
   }
   networkQuality: NetworkQuality
   leaveAgoraRoom: () => Promise<void>
   localStream: LocalStream
   handleScreenShare: (optimizationMode?: "detail" | "motion") => Promise<void>
   setDesktopMode: (
      mode: LivestreamEvent["mode"],
      initiatorId: string
   ) => Promise<void>
}

/**
 * Props object for customising the RTC functionality
 */
export interface RtcPropsInterface {
   /**
    * Agora App ID - used to authenticate the request
    */
   appId: string
   /**
    * Channel name to join - users in the same channel can communicate with each other
    */
   channel: string
   /**
    * UID for local user to join the channel (default: 0)
    */
   uid?: string
   /**
    * To see if the user can publish video, set this to true. (default: false)
    */
   isStreamer?: boolean
   /*
    * The identifier of the user who is currently sharing their screen
    * */
   screenSharerId?: string
   /*
    * These modes are used to dictate how the livestream is displayed in the UI
    * - presentation: A PDF presentation is currently being shared
    * - video: A YouTube video is currently being shared
    * - desktop: A user's screen is currently being shared
    */
   streamMode?: LivestreamEvent["mode"]

   /**
    * Viewers should only join the RTC channel when the livestream is live or
    * he's spying
    */
   allowViewerToJoin?: boolean

   children: React.ReactNode | null
}

/**
 * Context to access local/remote tracks, client, dispatch and local UID. It's setup by {@link RTCProvider}.
 */
const RTCContext = React.createContext<RtcContextInterface>(
   {} as RtcContextInterface
)

export default RTCContext
