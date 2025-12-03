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

   // Helper for sentiment emoji
   const getSentimentEmoji = () => {
      const roundedRating = Math.round(averageRating)
      const clampedRating = Math.max(
         1,
         Math.min(5, roundedRating)
      ) as keyof typeof SENTIMENT_EMOJIS
      return SENTIMENT_EMOJIS[clampedRating]
   }

   // Calculate sentiment percentage for the displayed emoji
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
      sentimentEmoji: getSentimentEmoji(),
      sentimentPercentage,
   }
}
