import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { useFeedbackDialogContext } from "./FeedbackDialog"
import { FeedbackQuestionCard } from "./FeedbackQuestionCard"

const styles = sxStyles({
   container: {
      width: "100%",
   },
})

export const FeedbackQuestionList = () => {
   const { allFeedbackQuestions, selectedFeedbackQuestion } =
      useFeedbackDialogContext()

   const filteredFeedbackQuestions = allFeedbackQuestions.filter(
      (question) => question.id !== selectedFeedbackQuestion.id
   )

   if (filteredFeedbackQuestions.length === 0) return null

   return (
      <Stack spacing={2} sx={styles.container}>
         <Typography variant="brandedH5" color="text.primary">
            Other feedback questions
         </Typography>
         <Stack spacing={1.5}>
            {filteredFeedbackQuestions.map((question) => (
               <FeedbackQuestionCard key={question.id} question={question} />
            ))}
         </Stack>
      </Stack>
   )
}
