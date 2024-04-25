import { FC, useCallback, useState } from "react"
import RemoveQuestion from "./RemoveQuestion"
import { SwipeableDrawer } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"
import { FeedbackQuestionsProp } from "../commons"
import AddQuestionButton from "./AddQuestionButton"
import FeedbackQuestionMobile from "./FeedbackQuestionMobile"

const styles = sxStyles({
   drawer: {
      ".MuiPaper-root": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
})

const FeedbackQuestionsMobile: FC<
   FeedbackQuestionsProp & { handleAddQuestionClick: () => void }
> = ({
   questions,
   handleAddQuestionClick, // this is for testing purposes only
}) => {
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [currentQuestion, setCurrentQuestion] = useState(null)
   const [isDrawerOpen, setIsDrawerOpen] = useState(false)

   const handleEdit = useCallback((_, question) => {
      setCurrentQuestion(question)
   }, [])

   const handleRemove = useCallback((_, question) => {
      setCurrentQuestion(question)
      setIsDrawerOpen(true)
   }, [])

   return (
      <>
         {questions.map((question, index) => (
            <FeedbackQuestionMobile
               key={index}
               question={question}
               handleEdit={(event) => handleEdit(event, question)}
               handleRemove={(event) => handleRemove(event, question)}
            />
         ))}
         <AddQuestionButton handleClick={handleAddQuestionClick} />
         <SwipeableDrawer
            anchor="bottom"
            onClose={() => setIsDrawerOpen(false)}
            onOpen={() => null}
            open={isDrawerOpen}
            sx={styles.drawer}
         >
            <RemoveQuestion handleCancelClick={() => setIsDrawerOpen(false)} />
         </SwipeableDrawer>
      </>
   )
}

export default FeedbackQuestionsMobile
