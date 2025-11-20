import useSWRCountQuery from "components/custom-hook/useSWRCountQuery"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query, where } from "firebase/firestore"
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

   const averageRating =
      liveStreamStats?.ratings?.[question.id]?.averageRating ?? 0

   const votersCollection = collection(
      FirestoreInstance,
      "livestreams",
      liveStreamStats.livestream.id,
      "rating",
      question.id,
      "voters"
   )

   const votersQuery = query(
      votersCollection,
      ...(question.type === FeedbackQuestionType.TEXT
         ? [where("message", "!=", "")]
         : [])
   )

   const { count: fetchedCount } = useSWRCountQuery(votersQuery)

   const numberOfAnswers = fetchedCount ?? 0

   // For sentiment ratings, fetch voters to calculate percentage
   const { data: voters = [] } = useLivestreamRatingVoters(
      liveStreamStats.livestream.id,
      question.id,
      question.type === FeedbackQuestionType.TEXT
   )

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

      // Count voters with rating matching the displayed emoji
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
