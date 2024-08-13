import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { livestreamService } from "data/firebase/LivestreamService"
import { useCallback } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "../../context"
import { FeedbackQuestionCard } from "../feedback-questions/FeedbackQuestionCard"
import { FeedbackQuestion } from "../feedback-questions/FeedbackQuestionsTracker"
import { SnackbarNotification } from "./SnackbarNotification"

type Props = {
   question: FeedbackQuestion
   questionNumber: number
   onAnswer: (question: FeedbackQuestion) => void
}

export const FeedbackQuestionSnackbarCard = ({
   question,
   questionNumber,
   onAnswer,
}: Props) => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { data: streamerDetails } = useStreamerDetails(agoraUserId)

   const handleDismiss = useCallback(
      (question: FeedbackQuestion) => {
         try {
            livestreamService.optOutFeedbackQuestion(
               livestreamId,
               question.id,
               agoraUserId,
               streamerDetails
            )
         } catch (error) {
            errorLogAndNotify(error, {
               livestreamId: livestreamId,
               questionId: question.id,
               agoraUserId: agoraUserId,
            })
         }
         onAnswer(question)
      },
      [agoraUserId, livestreamId, streamerDetails, onAnswer]
   )

   return (
      <>
         <SnackbarNotification.Header
            handleClose={() => handleDismiss(question)}
         >
            Question {questionNumber}
         </SnackbarNotification.Header>
         <FeedbackQuestionCard question={question} onAnswer={onAnswer} />
      </>
   )
}
