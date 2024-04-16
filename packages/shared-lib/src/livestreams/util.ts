import { LivestreamQuestion } from "./livestreams"

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
