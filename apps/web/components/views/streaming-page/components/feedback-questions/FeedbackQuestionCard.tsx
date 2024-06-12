import CloseIcon from "@mui/icons-material/Close"
import {
   Box,
   IconButton,
   Snackbar,
   SnackbarContent,
   Stack,
   Typography,
} from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { FeedbackQuestionType } from "components/views/group/admin/events/detail/form/views/questions/commons"
import { livestreamService } from "data/firebase/LivestreamService"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "../../context"
import RatingQuestion from "./RatingQuestion"
import SentimentQuestion from "./SentimentQuestion"

const styles = sxStyles({
   dialog: {
      display: "inline-flex",
      padding: 2,
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 1.5,
      maxWidth: "356px",
      borderRadius: "12px",
      background: "white",
      boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
      color: (theme) => theme.palette.neutral[900],
   },
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
}

export const FeedbackQuestionCard = ({
   question,
   questionNumber,
   open,
   onAnswer,
}) => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { userData } = useAuth()
   const QuestionAction = QuestionsComponents[question?.type] || <></>

   const handleClose = () => {
      try {
         livestreamService.optOutFeedbackQuestion(
            livestreamId,
            question.id,
            agoraUserId,
            { id: userData.id, userEmail: userData.userEmail }
         )
      } catch (error) {
         errorLogAndNotify(error, {
            livestreamId: livestreamId,
            questionId: question.id,
            user: userData.id,
         })
      }
      onAnswer(question)
   }

   const handleSubmit = (event, value: number) => {
      console.log(value)
      try {
         livestreamService.answerFeedbackQuestion(
            livestreamId,
            question.id,
            agoraUserId,
            { id: userData.id, userEmail: userData.userEmail },
            { rating: value }
         )
      } catch (error) {
         errorLogAndNotify(error, {
            livestreamId: livestreamId,
            questionId: question.id,
            user: userData.id,
         })
      }
      onAnswer(question)
   }

   return (
      <Snackbar key={question.id} open={open}>
         <SnackbarContent
            sx={styles.dialog}
            message={
               <Box>
                  <Stack spacing={"20px"} sx={styles.content}>
                     <Stack sx={styles.header}>
                        <Typography variant="brandedH5" sx={styles.headerText}>
                           Question {questionNumber}
                        </Typography>
                        <IconButton onClick={handleClose}>
                           <CloseIcon />
                        </IconButton>
                     </Stack>
                     <Typography variant="brandedBody">
                        {question.question}
                     </Typography>
                     <QuestionAction
                        name={question.id}
                        onChange={handleSubmit}
                     />
                  </Stack>
               </Box>
            }
         />
      </Snackbar>
   )
}
