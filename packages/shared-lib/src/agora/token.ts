export type AgoraTokenResponse = {
   status: number
   token: { rtcToken: string }
}
export type AgoraTokenRequest = {
   isStreamer: boolean
   uid: string
   sentToken: string
   channelName: string
   streamDocumentPath: string
}
