import React from "react"
import {
   IAgoraRTCClient,
   ILocalAudioTrack,
   ILocalVideoTrack,
   NetworkQuality,
   UID,
} from "agora-rtc-sdk-ng"
import { LocalStream } from "../../types/streaming"

export interface RtcContextInterface {
   screenShareStream: ILocalVideoTrack | [ILocalVideoTrack, ILocalAudioTrack]
   remoteStreams: any[]
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
      initializeVideoCameraAudioTrack: () => Promise<void>
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
   publishScreenShareStream: (
      screenSharingMode,
      onScreenShareStopped
   ) => Promise<void>
   handleReconnectAgora: (options: { rePublish?: boolean }) => Promise<void>
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
   uid?: UID
   /**
    * To see is the user is a hand raiser, set this to true. (default: false)
    */
   isAHandRaiser?: boolean
   /**
    * To see if the user is a host, set this to true. (default: false)
    */
   isStreamer?: boolean
   /**
    * Weather or not to initialize the RTC SDK (default: false)
    */
   initialize: boolean
}

/**
 * Context to access local/remote tracks, client, dispatch and local UID. It's setup by {@link RTCProvider}.
 */
const RTCContext = React.createContext<RtcContextInterface>(
   {} as RtcContextInterface
)

export default RTCContext
