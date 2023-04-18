import Stack from "@mui/material/Stack"
import React, { FC } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { useFirestoreCollection } from "../../../../../../custom-hook/utils/useFirestoreCollection"
import { collection, query } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { useFirestoreDocument } from "../../../../../../custom-hook/utils/useFirestoreDocument"

type FeedbackAnswersContentProps = {
   livestreamStats: LiveStreamStats
   feedbackQuestionId: string
}
export const RatingAnswers: FC<FeedbackAnswersContentProps> = ({
   livestreamStats,
   feedbackQuestionId,
}) => {
   console.log("-> livestreamStats", livestreamStats)
   console.log("-> feedbackQuestionId", feedbackQuestionId)
   const { data: voters } = useFirestoreCollection(
      query(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamStats.livestream.id,
            "rating",
            feedbackQuestionId,
            "voters"
         )
      )
   )
   console.log("-> voters", voters)
   const { data: feedbackQuestion } = useFirestoreDocument("livestreams", [
      livestreamStats.livestream.id,
      "rating",
      feedbackQuestionId,
   ])
   console.log("-> feedbackQuestion", feedbackQuestion)

   return <Stack spacing={3}>User feedback answers</Stack>
}

export const RatingAnswersSkeleton: FC = () => {
   return <Stack spacing={3}>User feedback answers</Stack>
}

export default RatingAnswers
