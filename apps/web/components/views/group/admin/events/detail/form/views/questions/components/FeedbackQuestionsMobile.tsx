import { sxStyles } from "@careerfairy/shared-ui"
import { SwipeableDrawer } from "@mui/material"
import { useCallback, useState } from "react"
import { useLivestreamCreationContext } from "../../../../LivestreamCreationContext"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import { getNewQuestionFormValues } from "../commons"
import AddQuestionButton from "./AddQuestionButton"
import FeedbackQuestionMobile from "./FeedbackQuestionMobile"
import RemoveQuestion from "./RemoveQuestion"

const styles = sxStyles({
   drawer: {
      ".MuiPaper-root": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
})

const FeedbackQuestionsMobile = () => {
   const {
      values: { questions },
      setFieldValue,
   } = useLivestreamFormValues()
   const { livestream } = useLivestreamCreationContext()
   const [currentQuestion, setCurrentQuestion] = useState(null)
   const [isDrawerOpen, setIsDrawerOpen] = useState(false)

   const handleRemove = useCallback((question) => {
      setCurrentQuestion(question)
      setIsDrawerOpen(true)
   }, [])

   const handleAddQuestionClick = useCallback(() => {
      setFieldValue("questions.feedbackQuestions", [
         ...questions.feedbackQuestions,
         getNewQuestionFormValues,
      ])
   }, [questions, setFieldValue])

   const handleRemoveClick = useCallback(() => {
      setFieldValue(
         "questions.feedbackQuestions",
         questions.feedbackQuestions.map((question) => {
            if (question.id === currentQuestion.id) {
               return {
                  ...currentQuestion,
                  deleted: true,
               }
            } else {
               return question
            }
         })
      )
      setIsDrawerOpen(false)
      setCurrentQuestion(null)
   }, [currentQuestion, questions, setFieldValue])

   const handleCancelClick = useCallback(() => {
      setIsDrawerOpen(false)
      setCurrentQuestion(null)
   }, [])

   return (
      <>
         {questions.feedbackQuestions
            .filter((question) => !question.deleted)
            .map((question, index) => (
               <FeedbackQuestionMobile
                  key={index}
                  question={question}
                  handleRemove={() => handleRemove(question)}
               />
            ))}
         {!livestream.hasEnded && (
            <AddQuestionButton handleClick={handleAddQuestionClick} />
         )}
         <SwipeableDrawer
            anchor="bottom"
            onClose={() => setIsDrawerOpen(false)}
            onOpen={() => null}
            open={isDrawerOpen}
            sx={styles.drawer}
         >
            <RemoveQuestion
               handleRemoveClick={handleRemoveClick}
               handleCancelClick={handleCancelClick}
            />
         </SwipeableDrawer>
      </>
   )
}

export default FeedbackQuestionsMobile
