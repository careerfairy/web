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
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { livestreamService } from "data/firebase/LivestreamService"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "../../context"
import RatingQuestion from "./RatingQuestion"

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

export const FeedbackQuestionCard = ({
   question,
   questionNumber,
   open,
   onAnswer,
}) => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { userData } = useAuth()
   const { errorNotification } = useSnackbarNotifications()

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
      try {
         livestreamService.answerFeedbackQuestion(
            livestreamId,
            question.id,
            agoraUserId,
            { id: userData.id, userEmail: userData.userEmail },
            { rating: value }
         )
      } catch (error) {
         errorNotification(
            error,
            "An error occurred while answering the question."
         )
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
                     <RatingQuestion
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
