import {
   ConnectionDisconnectedReason,
   ConnectionState,
   IAgoraRTCRemoteUser,
   ICameraVideoTrack,
   IMicrophoneAudioTrack,
   UID,
} from "agora-rtc-sdk-ng"

export interface LocalStream {
   uid: UID
   isAudioPublished: boolean
   isVideoPublished: boolean
   isLocal: boolean
   audioTrack?: IMicrophoneAudioTrack
   videoTrack?: ICameraVideoTrack
   videoMuted?: boolean
   audioMuted?: boolean
}

export interface LocalMediaHandlers {
   initializeLocalAudioStream: () => Promise<any>
   initializeLocalVideoStream: () => Promise<any>
   initializeVideoCameraAudioTrack: () => Promise<any>
   closeLocalCameraTrack: () => Promise<any>
   closeLocalMicrophoneTrack: () => Promise<any>
}
export interface MediaControls {
   audioSource: MediaDeviceInfo["deviceId"]
   videoSource: MediaDeviceInfo["deviceId"]
   updateAudioSource: (deviceId: MediaDeviceInfo["deviceId"]) => Promise<any>
   updateVideoSource: (deviceId: MediaDeviceInfo["deviceId"]) => Promise<any>
}

export interface DeviceList {
   audioInputList: DeviceOption[]
   audioOutputList: DeviceOption[]
   videoDeviceList: DeviceOption[]
}

export interface DeviceOption {
   value: MediaDeviceInfo["deviceId"]
   text: MediaDeviceInfo["label"] | string
}

export interface RemoteStreamUser extends IAgoraRTCRemoteUser {
   audioMuted?: boolean
   videoMuted?: boolean
}

export enum RTCSubscribeErrorCodes {
   /**
    * An incorrect operation, indicating that subscribe is called before joining the channel successfully.
    */
   INVALID_OPERATION = "INVALID_OPERATION",
   /**
    *  An incorrect remote user object is passed in; for example, the user is not in the channel.
    */
   INVALID_REMOTE_USER = "INVALID_REMOTE_USER",
   /**
    *  The passed remote user has not published the media type in the subscribe method.
    */
   REMOTE_USER_IS_NOT_PUBLISHED = "REMOTE_USER_IS_NOT_PUBLISHED",
   /**
    *  The Agora server returns an unexpected response, and the subscription fails. Agora recommends that you keep the log and contact Agora Technical Support.
    */
   UNEXPECTED_RESPONSE = "UNEXPECTED_RESPONSE",
   /**
    *  The subscription is aborted, possibly because the user calls leave to leave the channel before the subscription succeeds.
    */
   OPERATION_ABORTED = "OPERATION_ABORTED",
   /**
    *  The local network exit cannot be found, possibly because a network firewall does not allow the connection or a browser plug-in disables WebRTC. See [FAQ](https://docs.agora.io/en/faq/console_error_web#none-ice-candidate-not-alloweda-namecandidatea) for details.
    *
    *  If cloud proxy is off, you can:
    *       - turn it on
    *       - Check whether the browser has any plugins that disable WebRTC.
    *       - Ensure that you have enabled UDP in the system firewall, and added the [specified domains and ports to the whitelist](https://docs.agora.io/en/Agora%20Platform/firewall?platform=All%20Platforms#web-sdk).
    *
    * If cloud proxy is on, the SDK gets relay candidates from a TURN server so:
    *       - Check whether you have whitelisted the IP addresses and ports that Agora provides for cloud proxy
    *       - ensure that the local client can connect to the TURN server
    */
   NO_ICE_CANDIDATE = "NO_ICE_CANDIDATE",
}
export enum RTCPublishErrorCodes {
   /**
    * An incorrect operation, indicating that publish is called before joining the channel successfully.
    */
   INVALID_OPERATION = "INVALID_OPERATION",
   /**
    *  The publishing is aborted, possibly because the user calls leave to leave the channel before the publishing succeeds.
    */
   OPERATION_ABORTED = "OPERATION_ABORTED",
   /**
    *  The passed remote user has not published the media type in the subscribe method.
    */
   INVALID_LOCAL_TRACK = "INVALID_LOCAL_TRACK",
   /**
    *   Parameter error, the LocalTrack object is incorrect.
    */
   CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS = "CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS",
   /**
    *    The SDK does not support publishing multiple video tracks at the same time.
    */
   NOT_SUPPORTED = "NOT_SUPPORTED",
   /**
    *     Multiple audio tracks are published, but the browser does not support audio mixing.
    */
   UNEXPECTED_RESPONSE = "UNEXPECTED_RESPONSE",
   /**
    *     The Agora server returns an unexpected response, and the publishing fails. Agora recommends that you keep the log and contact [Agora Technical Support](https://agora-ticket.agora.io/).
    */
   NO_ICE_CANDIDATE = "NO_ICE_CANDIDATE",
   /**
    *      The local network exit cannot be found, possibly because a network firewall does not allow the connection or a browser plug-in disables WebRTC. See [FAQ](https://docs.agora.io/en/faq/console_error_web#none-ice-candidate-not-alloweda-namecandidatea) for details.
    */
}
export enum CustomRTCErrors {
   /**
    * If cloud proxy is on, the SDK gets relay candidates from a TURN server so:
    *       - Check whether you have whitelisted the IP addresses and ports that Agora provides for cloud proxy
    *       - ensure that the local client can connect to the TURN server
    */
   FAILED_TO_SUBSCRIBE_WITH_PROXY = "FAILED_TO_SUBSCRIBE_WITH_PROXY",
   /**
    *  If cloud proxy is off, you can:
    *       - turn it on
    *       - Check whether the browser has any plugins that disable WebRTC.
    *       - Ensure that you have enabled UDP in the system firewall, and added the [specified domains and ports to the whitelist](https://docs.agora.io/en/Agora%20Platform/firewall?platform=All%20Platforms#web-sdk).
    */
   FAILED_TO_SUBSCRIBE_WITHOUT_PROXY = "FAILED_TO_SUBSCRIBE_WITHOUT_PROXY",
   /**
    *  Browser has denied access to microphone
    */
   MICROPHONE_PERMISSION_DENIED = "MICROPHONE_PERMISSION_DENIED",
   /**
    *  Browser has denied access to camera
    */
   CAMERA_PERMISSION_DENIED = "CAMERA_PERMISSION_DENIED",
}

enum CustomConnectionDisconnectedReason {
   /**
    * This reason will be used when the RTCClient join method takes too long without throwing an exception.
    * Most common reason for this is that the client is still trying to find a port
    */
   SLOW_CONNECTING = "SLOW_CONNECTING",
}
export interface RTCError extends Error {
   readonly code:
      | string
      | RTCSubscribeErrorCodes
      | RTCPublishErrorCodes
      | CustomRTCErrors
   readonly message: string
   readonly name: string
   readonly data?: any
}

export interface RTCConnectionState {
   curState: ConnectionState
   prevState: ConnectionState
   reason?: ConnectionDisconnectedReason
   warning?: CustomConnectionDisconnectedReason
}
type Messages = {
   [key in ConnectionState]?: string
}
export const rtcMessages: Messages = {
   DISCONNECTED: "Disconnected",
   RECONNECTING:
      "It seems like the connection got interrupted. Attempting to reconnect...",
   CONNECTING: "Connecting...",
   CONNECTED: "Connected",
   DISCONNECTING: "",
}
