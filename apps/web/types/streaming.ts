import {
   ConnectionDisconnectedReason,
   ConnectionState,
   IAgoraRTCRemoteUser,
   ICameraVideoTrack,
   IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng"

export interface LocalStream {
   uid: string
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

/**
 * @ignore
 */
export enum AgoraRTCErrorCode {
   UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
   UNEXPECTED_RESPONSE = "UNEXPECTED_RESPONSE",
   TIMEOUT = "TIMEOUT",
   INVALID_PARAMS = "INVALID_PARAMS",
   NOT_SUPPORTED = "NOT_SUPPORTED",
   INVALID_OPERATION = "INVALID_OPERATION",
   OPERATION_ABORTED = "OPERATION_ABORTED",
   WEB_SECURITY_RESTRICT = "WEB_SECURITY_RESTRICT",
   NETWORK_ERROR = "NETWORK_ERROR",
   NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
   NETWORK_RESPONSE_ERROR = "NETWORK_RESPONSE_ERROR",
   API_INVOKE_TIMEOUT = "API_INVOKE_TIMEOUT",
   ENUMERATE_DEVICES_FAILED = "ENUMERATE_DEVICES_FAILED",
   DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND",
   ELECTRON_IS_NULL = "ELECTRON_IS_NULL",
   ELECTRON_DESKTOP_CAPTURER_GET_SOURCES_ERROR = "ELECTRON_DESKTOP_CAPTURER_GET_SOURCES_ERROR",
   CHROME_PLUGIN_NO_RESPONSE = "CHROME_PLUGIN_NO_RESPONSE",
   CHROME_PLUGIN_NOT_INSTALL = "CHROME_PLUGIN_NOT_INSTALL",
   MEDIA_OPTION_INVALID = "MEDIA_OPTION_INVALID",
   PERMISSION_DENIED = "PERMISSION_DENIED",
   CONSTRAINT_NOT_SATISFIED = "CONSTRAINT_NOT_SATISFIED",
   TRACK_IS_DISABLED = "TRACK_IS_DISABLED",
   SHARE_AUDIO_NOT_ALLOWED = "SHARE_AUDIO_NOT_ALLOWED",
   LOW_STREAM_ENCODING_ERROR = "LOW_STREAM_ENCODING_ERROR",
   INVALID_UINT_UID_FROM_STRING_UID = "INVALID_UINT_UID_FROM_STRING_UID",
   CAN_NOT_GET_PROXY_SERVER = "CAN_NOT_GET_PROXY_SERVER",
   CAN_NOT_GET_GATEWAY_SERVER = "CAN_NOT_GET_GATEWAY_SERVER",
   VOID_GATEWAY_ADDRESS = "VOID_GATEWAY_ADDRESS",
   UID_CONFLICT = "UID_CONFLICT",
   INVALID_LOCAL_TRACK = "INVALID_LOCAL_TRACK",
   INVALID_TRACK = "INVALID_TRACK",
   SENDER_NOT_FOUND = "SENDER_NOT_FOUND",
   CREATE_OFFER_FAILED = "CREATE_OFFER_FAILED",
   SET_ANSWER_FAILED = "SET_ANSWER_FAILED",
   ICE_FAILED = "ICE_FAILED",
   PC_CLOSED = "PC_CLOSED",
   SENDER_REPLACE_FAILED = "SENDER_REPLACE_FAILED",
   GATEWAY_P2P_LOST = "GATEWAY_P2P_LOST",
   NO_ICE_CANDIDATE = "NO_ICE_CANDIDATE",
   CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS = "CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS",
   EXIST_DISABLED_VIDEO_TRACK = "EXIST_DISABLED_VIDEO_TRACK",
   INVALID_REMOTE_USER = "INVALID_REMOTE_USER",
   REMOTE_USER_IS_NOT_PUBLISHED = "REMOTE_USER_IS_NOT_PUBLISHED",
   CUSTOM_REPORT_SEND_FAILED = "CUSTOM_REPORT_SEND_FAILED",
   CUSTOM_REPORT_FREQUENCY_TOO_HIGH = "CUSTOM_REPORT_FREQUENCY_TOO_HIGH",
   FETCH_AUDIO_FILE_FAILED = "FETCH_AUDIO_FILE_FAILED",
   READ_LOCAL_AUDIO_FILE_ERROR = "READ_LOCAL_AUDIO_FILE_ERROR",
   DECODE_AUDIO_FILE_FAILED = "DECODE_AUDIO_FILE_FAILED",
   WS_ABORT = "WS_ABORT",
   WS_DISCONNECT = "WS_DISCONNECT",
   WS_ERR = "WS_ERR",
   LIVE_STREAMING_TASK_CONFLICT = "LIVE_STREAMING_TASK_CONFLICT",
   LIVE_STREAMING_INVALID_ARGUMENT = "LIVE_STREAMING_INVALID_ARGUMENT",
   LIVE_STREAMING_INTERNAL_SERVER_ERROR = "LIVE_STREAMING_INTERNAL_SERVER_ERROR",
   LIVE_STREAMING_PUBLISH_STREAM_NOT_AUTHORIZED = "LIVE_STREAMING_PUBLISH_STREAM_NOT_AUTHORIZED",
   LIVE_STREAMING_TRANSCODING_NOT_SUPPORTED = "LIVE_STREAMING_TRANSCODING_NOT_SUPPORTED",
   LIVE_STREAMING_CDN_ERROR = "LIVE_STREAMING_CDN_ERROR",
   LIVE_STREAMING_INVALID_RAW_STREAM = "LIVE_STREAMING_INVALID_RAW_STREAM",
   LIVE_STREAMING_WARN_STREAM_NUM_REACH_LIMIT = "LIVE_STREAMING_WARN_STREAM_NUM_REACH_LIMIT",
   LIVE_STREAMING_WARN_FAILED_LOAD_IMAGE = "LIVE_STREAMING_WARN_FAILED_LOAD_IMAGE",
   LIVE_STREAMING_WARN_FREQUENT_REQUEST = "LIVE_STREAMING_WARN_FREQUENT_REQUEST",
   WEBGL_INTERNAL_ERROR = "WEBGL_INTERNAL_ERROR",
   BEAUTY_PROCESSOR_INTERNAL_ERROR = "BEAUTY_PROCESSOR_INTERNAL_ERROR",
   CROSS_CHANNEL_WAIT_STATUS_ERROR = "CROSS_CHANNEL_WAIT_STATUS_ERROR",
   CROSS_CHANNEL_FAILED_JOIN_SRC = "CROSS_CHANNEL_FAILED_JOIN_SEC",
   CROSS_CHANNEL_FAILED_JOIN_DEST = "CROSS_CHANNEL_FAILED_JOIN_DEST",
   CROSS_CHANNEL_FAILED_PACKET_SENT_TO_DEST = "CROSS_CHANNEL_FAILED_PACKET_SENT_TO_DEST",
   CROSS_CHANNEL_SERVER_ERROR_RESPONSE = "CROSS_CHANNEL_SERVER_ERROR_RESPONSE",
   METADATA_OUT_OF_RANGE = "METADATA_OUT_OF_RANGE",
}
