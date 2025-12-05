import { useMemo } from "react"
import {
   EventRatingWithType,
   FeedbackQuestionType,
   SENTIMENT_EMOJIS,
} from "../../../events/detail/form/views/questions/commons"
import { useFeedbackDialogContext } from "./FeedbackDialog"
import useLivestreamRatingVoters from "./useLivestreamRatingVoters"

export const useFeedbackQuestionStats = (question: EventRatingWithType) => {
   const { liveStreamStats } = useFeedbackDialogContext()

   const { data: voters = [] } = useLivestreamRatingVoters(
      liveStreamStats.livestream.id,
      question.id,
      question.type === FeedbackQuestionType.TEXT
   )

   const { averageRating, numberOfAnswers } = useMemo(() => {
      // For text-only questions, count is simply the number of responses
      if (question.type === FeedbackQuestionType.TEXT) {
         return { averageRating: 0, numberOfAnswers: voters.length }
      }

      if (voters.length === 0) {
         return { averageRating: 0, numberOfAnswers: 0 }
      }

      let sum = 0
      let count = 0

      voters.forEach((voter) => {
         const rating = voter.rating
         if (typeof rating === "number") {
            sum += rating
            count++
         }
      })

      return {
         averageRating: count > 0 ? sum / count : 0,
         numberOfAnswers: count,
      }
   }, [voters, question.type])

   // Get the most voted sentiment emoji
   const mostVotedEmoji = useMemo(() => {
      if (question.type !== FeedbackQuestionType.SENTIMENT_RATING) {
         return "—"
      }

      if (numberOfAnswers === 0) {
         return "—"
      }

      // Build stats: count votes per rating value
      const stats: Record<number, number> = {}
      voters.forEach((voter) => {
         const rating = voter.rating
         if (typeof rating === "number") {
            stats[rating] = (stats[rating] || 0) + 1
         }
      })

      // Find most voted
      let mostVotedVal = 0
      let maxVotes = -1
      Object.entries(stats).forEach(([val, count]) => {
         if (count > maxVotes) {
            maxVotes = count
            mostVotedVal = parseInt(val)
         }
      })

      return (
         SENTIMENT_EMOJIS[mostVotedVal as keyof typeof SENTIMENT_EMOJIS] || "—"
      )
   }, [question.type, numberOfAnswers, voters])

   // Calculate overall sentiment percentage (average rating as % of max)
   const sentimentPercentage = useMemo(() => {
      if (question.type !== FeedbackQuestionType.SENTIMENT_RATING) {
         return null
      }

      if (numberOfAnswers === 0) {
         return 0
      }

      const roundedRating = Math.round(averageRating)
      const displayedRating = Math.max(1, Math.min(5, roundedRating))

      let matchingCount = 0
      voters.forEach((voter) => {
         const voterRating = voter.rating || 0
         if (voterRating === displayedRating) {
            matchingCount++
         }
      })

      return Math.round((matchingCount / numberOfAnswers) * 100)
   }, [question.type, averageRating, numberOfAnswers, voters])

   return {
      averageRating,
      numberOfAnswers,
      sentimentEmoji: mostVotedEmoji,
      sentimentPercentage,
   }
}
