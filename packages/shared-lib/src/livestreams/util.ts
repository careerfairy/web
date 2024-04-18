import { isDefinedAndEqual } from "../utils"
import { LivestreamQuestion, LivestreamQuestionComment } from "./livestreams"

/**
 * Backwards compatibility for checking if a user has upvoted a question
 * Future upvote functionality will use the `voterIds` instead of `emailOfVoters` fields
 * So that we stop storing emails in the database
 */
export const hasUpvotedLivestreamQuestion = (
   livestreamQuestion: LivestreamQuestion,
   identifiers: {
      email: string
      uid: string
      deprecatedSessionUuid?: string
   }
) => {
   return (
      livestreamQuestion.emailOfVoters?.includes(
         `streamerEmail${identifiers?.deprecatedSessionUuid}`
      ) ||
      livestreamQuestion.emailOfVoters?.includes(identifiers?.email) ||
      livestreamQuestion.voterIds?.includes(identifiers?.uid)
   )
}

/**
 * Checks if the provided identifiers match the author of the question.
 * This method ensures backward compatibility with different identifier systems.
 *
 * @param question - The question to check the authorship against.
 * @param identifiers - The identifiers to check. Can include email, uid, or agoraUid.
 * @returns Returns true if any of the identifiers match the author of the question.
 */
export const checkIsQuestionAuthor = (
   question: LivestreamQuestion,
   identifiers: {
      email: string
      uid: string
      agoraUid?: string
   }
) => {
   return (
      isDefinedAndEqual(question.author, identifiers.email) ||
      isDefinedAndEqual(question.author, identifiers.uid) ||
      isDefinedAndEqual(question.agoraUserId, identifiers.agoraUid)
   )
}

/**
 * Checks if the provided identifiers match the author of the comment.
 * This method ensures backward compatibility with different identifier systems.
 *
 * @param comment - The comment to check the authorship against.
 * @param identifiers - The identifiers to check. Can include email, uid, or agoraUid.
 * @returns Returns true if any of the identifiers match the author of the comment.
 */
export const checkIsQuestionCommentAuthor = (
   comment: LivestreamQuestionComment,
   identifiers: {
      uid: string
      agoraUid?: string
   }
) => {
   return (
      isDefinedAndEqual(comment.userUid, identifiers.uid) ||
      isDefinedAndEqual(comment.agoraUserId, identifiers.agoraUid)
   )
}
