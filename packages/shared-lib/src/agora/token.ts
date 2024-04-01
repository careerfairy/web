export type AgoraRTCTokenResponse = {
   status: number
   token: { rtcToken: string }
}
export type AgoraRTCTokenRequest = {
   isStreamer: boolean
   uid: string
   sentToken: string
   channelName: string
   streamDocumentPath: string
}

export type AgoraRTMTokenRequest = {
   uid: string
}

export type AgoraRTMTokenResponse = {
   status: number
   token: { rtmToken: string }
}
