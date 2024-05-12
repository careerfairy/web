import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { isDefinedAndEqual } from "@careerfairy/shared-lib/utils"
import { UserType } from "../../util"

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
      return UserType.CareerFairy
   }
   if (getIsHost(entry)) {
      return UserType.Streamer
   }
   return UserType.Viewer
}
