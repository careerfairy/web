import { LivestreamQuestionComment } from "@careerfairy/shared-lib/livestreams"
import { UserType } from "../../util"

export const getIsHost = (comment: LivestreamQuestionComment) => {
   return comment.author === "Streamer" || comment.authorType === "streamer"
}

export const getIsCareerFairy = (comment: LivestreamQuestionComment) => {
   return comment.authorType === "careerfairy"
}

export const getUserTypeFromComment = (comment: LivestreamQuestionComment) => {
   if (getIsCareerFairy(comment)) {
      return UserType.CareerFairy
   }
   if (getIsHost(comment)) {
      return UserType.Streamer
   }
   return UserType.Viewer
}
