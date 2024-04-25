import { ConnectionState } from "agora-rtc-react"

export const STREAM_IDENTIFIERS = {
   /** If an agora UID starts with this, it is a recording */
   RECORDING: "recording",
   /** If an agora UID starts with this, it is a creator */
   CREATOR: "creator",
   /** If an agora UID starts with this, it is a user */
   USER: "user",
   /** If an agora UID starts with this, it is an anonymous user */
   ANONYMOUS: "anon",
   /** If an agora UID starts with this, it is a screen share */
   SCREEN_SHARE: "screen",
} as const

export type StreamIdentifier =
   (typeof STREAM_IDENTIFIERS)[keyof typeof STREAM_IDENTIFIERS]

export const ConnectionStates: Record<ConnectionState, ConnectionState> = {
   CONNECTED: "CONNECTED",
   CONNECTING: "CONNECTING",
   RECONNECTING: "RECONNECTING",
   DISCONNECTED: "DISCONNECTED",
   DISCONNECTING: "DISCONNECTING",
}
