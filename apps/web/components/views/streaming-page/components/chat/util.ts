import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { isDefinedAndEqual } from "@careerfairy/shared-lib/utils"

export enum ChatAuthor {
   Viewer = "Viewer",
   Streamer = "Streamer",
   CareerFairy = "CareerFairy",
}

export const getIsMe = (
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

export const getIsHost = (entry: LivestreamChatEntry) => {
   return entry.authorEmail === "Streamer" || entry.type === "streamer"
}

export const getIsCareerFairy = (entry: LivestreamChatEntry) => {
   return entry.authorEmail.includes("@careerfairy.io")
}

export const getChatAuthor = (entry: LivestreamChatEntry) => {
   if (getIsCareerFairy(entry)) {
      return ChatAuthor.CareerFairy
   }
   if (getIsHost(entry)) {
      return ChatAuthor.Streamer
   }
   return ChatAuthor.Viewer
}
