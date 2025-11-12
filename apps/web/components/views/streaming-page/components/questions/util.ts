import { LivestreamQuestionComment } from "@careerfairy/shared-lib/livestreams"
import { UserType } from "../../util"

export const getIsHostFromComment = (comment: LivestreamQuestionComment) => {
   return comment.author === "Streamer" || comment.authorType === "streamer"
}

export const getIsCareerFairyFromComment = (
   comment: LivestreamQuestionComment
) => {
   return comment.authorType === "careerfairy"
}

export const getUserTypeFromComment = (comment: LivestreamQuestionComment) => {
   if (getIsCareerFairyFromComment(comment)) {
      return UserType.CareerFairy
   }
   if (getIsHostFromComment(comment)) {
      return UserType.Streamer
   }
   return UserType.Viewer
}

export const MIN_QUESTIONS_TO_SHOW = 10
