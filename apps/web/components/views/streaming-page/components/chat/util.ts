import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"

export const isMe = (
   entry: LivestreamChatEntry,
   agoraUserId: string,
   userEmail: string
) => {
   return entry.agoraUserId === agoraUserId || entry.authorEmail === userEmail
}

export const isHost = (entry: LivestreamChatEntry) => {
   return entry.authorEmail === "Streamer" || entry.type === "streamer"
}
