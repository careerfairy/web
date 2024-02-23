import { useCallback, useState } from "react"
import { SwipeableDrawer } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"
import RemoveQuestion from "./components/RemoveQuestion"
import useIsMobile from "components/custom-hook/useIsMobile"
import AddQuestionButton from "./components/AddQuestionButton"
import FeedbackQuestionMobile from "./components/FeedbackQuestionMobile"
import FeedbackQuestionsDesktop from "./components/FeedbackQuestionsDesktop"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"

const styles = sxStyles({
   drawer: {
      ".MuiPaper-root": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
})

const dummyFeedbackQuestions = [
   {
      title: "How happy are you with the content shared by us?",
      type: "Star rating",
      appearAfter: 30,
   },
   {
      title: "Help us to improve: How can they make the experience more useful to you and other students?",
      type: "Written review",
      appearAfter: 40,
   },
]

const newDummyFeedbackQuestion = {
   title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
   type: new Date().toString(),
   appearAfter: 40,
}

const FeedbackQuestions = () => {
   const isMobile = useIsMobile()
   const [feedbackQuestions, setFeedbackQuestions] = useState(
      dummyFeedbackQuestions
   )
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [currentQuestion, setCurrentQuestion] = useState(null)
   const [isDrawerOpen, setIsDrawerOpen] = useState(false)

   const [, handleAddEditOpenDialog] = useDialogStateHandler()

   const handleEdit = useCallback(
      (_, question) => {
         setCurrentQuestion(question)
         handleAddEditOpenDialog()
      },
      [handleAddEditOpenDialog]
   )

   const [, handleRemoveOpenDialog] = useDialogStateHandler()

   const handleRemove = useCallback(
      (_, question) => {
         setCurrentQuestion(question)
         if (isMobile) {
            setIsDrawerOpen(true)
         } else {
            handleRemoveOpenDialog()
         }
      },
      [handleRemoveOpenDialog, isMobile]
   )

   if (isMobile) {
      return (
         <>
            {feedbackQuestions.map((question, index) => (
               <FeedbackQuestionMobile
                  key={index}
                  question={question}
                  handleEdit={(event) => handleEdit(event, question)}
                  handleRemove={(event) => handleRemove(event, question)}
               />
            ))}
            <AddQuestionButton
               handleClick={() => {
                  setFeedbackQuestions([
                     ...feedbackQuestions,
                     newDummyFeedbackQuestion,
                  ])
               }}
            />
            <SwipeableDrawer
               anchor="bottom"
               onClose={() => setIsDrawerOpen(false)}
               onOpen={() => null}
               open={isDrawerOpen}
               sx={styles.drawer}
            >
               <RemoveQuestion
                  handleCancelClick={() => setIsDrawerOpen(false)}
               />
            </SwipeableDrawer>
         </>
      )
   }

   return <FeedbackQuestionsDesktop questions={feedbackQuestions} />
}

export default FeedbackQuestions
