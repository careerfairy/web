import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { isDefinedAndEqual } from "@careerfairy/shared-lib/utils"

export enum ChatAuthor {
   Viewer = "Viewer",
   Streamer = "Streamer",
   CareerFairy = "CareerFairy",
}

export const isMe = (
   entry: LivestreamChatEntry,
   agoraUserId: string,
   userEmail: string,
   userUid: string
) => {
   return (
      isDefinedAndEqual(entry.agoraUserId, agoraUserId) ||
      isDefinedAndEqual(entry.authorEmail, userEmail) ||
      isDefinedAndEqual(entry.userUid, userUid)
   )
}

export const isHost = (entry: LivestreamChatEntry) => {
   return entry.authorEmail === "Streamer" || entry.type === "streamer"
}

export const isCareerFairy = (entry: LivestreamChatEntry) => {
   return entry.authorEmail.includes("@careerfairy.io")
}

export const getChatAuthor = (entry: LivestreamChatEntry) => {
   if (isCareerFairy(entry)) {
      return ChatAuthor.CareerFairy
   }
   if (isHost(entry)) {
      return ChatAuthor.Streamer
   }
   return ChatAuthor.Viewer
}
