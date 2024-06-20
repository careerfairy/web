import CloseIcon from "@mui/icons-material/Close"
import { IconButton, Stack, Typography } from "@mui/material"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import {
   EventRatingWithType,
   FeedbackQuestionType,
} from "components/views/group/admin/events/detail/form/views/questions/commons"
import { livestreamService } from "data/firebase/LivestreamService"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "../../context"
import RatingQuestion from "./RatingQuestion"
import SentimentQuestion from "./SentimentQuestion"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
   },
   header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
   },
   headerText: {
      fontWeight: 600,
   },
})

export const QuestionsComponents = {
   [FeedbackQuestionType.STAR_RATING]: (props) => <RatingQuestion {...props} />,
   [FeedbackQuestionType.SENTIMENT_RATING]: (props) => (
      <SentimentQuestion {...props} />
   ),
   [FeedbackQuestionType.TEXT]: (props) => <RatingQuestion {...props} />,
}

type FeedbackQuestionCardProps = {
   question: EventRatingWithType
   questionNumber: number
   onAnswer: (question: EventRatingWithType) => void
}

export const FeedbackQuestionCard = ({
   question,
   questionNumber,
   onAnswer,
}: FeedbackQuestionCardProps) => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { data: streamerDetails } = useStreamerDetails(agoraUserId)
   const QuestionAction = QuestionsComponents[question.type]

   const handleClose = () => {
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
   }

   const handleSubmit = (event, value: number) => {
      try {
         livestreamService.answerFeedbackQuestion(
            livestreamId,
            question.id,
            agoraUserId,
            streamerDetails,
            { rating: value }
         )
      } catch (error) {
         errorLogAndNotify(error, {
            livestreamId: livestreamId,
            questionId: question.id,
            agoraUserId: agoraUserId,
         })
      }
      onAnswer(question)
   }

   return (
      <Stack spacing={"20px"} sx={styles.content}>
         <Stack sx={styles.header}>
            <Typography variant="brandedH5" sx={styles.headerText}>
               Question {questionNumber}
            </Typography>
            <IconButton onClick={handleClose}>
               <CloseIcon />
            </IconButton>
         </Stack>
         <Typography variant="brandedBody">{question.question}</Typography>
         <QuestionAction name={question.id} onChange={handleSubmit} />
      </Stack>
   )
}
