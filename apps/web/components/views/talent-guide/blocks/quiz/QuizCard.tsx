import { Box, Collapse, Stack, Typography } from "@mui/material"
import { QuizModelType } from "data/hygraph/types"
import { Fragment, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { AnswerButton } from "./AnswerButton"

const styles = sxStyles({
   question: {
      fontWeight: 700,
      color: "neutral.700",
   },
   correction: {
      mt: 1.5,
      p: 1,
      borderRadius: "8px",
      bgcolor: "rgba(255, 232, 232, 0.40)",
      border: (theme) => `1px solid ${theme.palette.error.main}`,
      display: "flex",
      alignItems: "center",
      whiteSpace: "pre-line",
   },
   correctionText: {
      fontWeight: 600,
      color: "error.main",
   },
})

type AnswerVariant = "default" | "selected" | "correct" | "correction" | "wrong"

const variantCycle: { variant: AnswerVariant; text: string }[] = [
   { variant: "default", text: "Default Answer" },
   { variant: "selected", text: "Selected Answer" },
   { variant: "correct", text: "Correct Answer" },
   { variant: "correction", text: "Should have been correct" },
   { variant: "wrong", text: "Wrong Answer" },
]

type Props = QuizModelType

export const QuizCard = ({
   // question,
   correction,
}: Props) => {
   console.log("🚀 ~ file: QuizCard.tsx:44 ~ correction:", correction)
   const [showAnsweredState, setShowAnsweredState] = useState(false)
   const [buttonStates, setButtonStates] = useState([
      { currentIndex: 0 },
      { currentIndex: 1 },
      { currentIndex: 2 },
      { currentIndex: 3 },
      { currentIndex: 4 },
   ])

   const handleButtonClick = (buttonIndex: number) => {
      setButtonStates((prev) => {
         const newStates = [...prev]
         newStates[buttonIndex] = {
            currentIndex:
               (prev[buttonIndex].currentIndex + 1) % variantCycle.length,
         }
         return newStates
      })
   }

   const toggleCorrection = () => {
      setShowAnsweredState(!showAnsweredState)
   }

   return (
      <Fragment>
         <Stack direction="column" spacing={1.5}>
            <Typography variant="mobileBrandedH4" sx={styles.question}>
               {/* {question} */}
               Demo of AnswerButton variants, Click to cycle through
            </Typography>
            {buttonStates.map((state, index) => {
               // For Demo purposes, we want to show the first button with a longer text
               const isFirst = index === 0
               return (
                  <AnswerButton
                     key={index}
                     onClick={() => handleButtonClick(index)}
                     variant={variantCycle[state.currentIndex].variant}
                  >
                     {`${variantCycle[state.currentIndex].text} ${
                        isFirst ? "lorem ipsum dolor sit amet".repeat(5) : ""
                     }`}
                  </AnswerButton>
               )
            })}
            <AnswerButton variant="default" onClick={toggleCorrection}>
               Toggle Correction
            </AnswerButton>
         </Stack>
         <Collapse in={showAnsweredState} unmountOnExit>
            <Box sx={styles.correction}>
               <Typography component="p" variant="small">
                  <Box component="span" sx={styles.correctionText}>
                     Correction:
                  </Box>{" "}
                  {correction}
               </Typography>
            </Box>
         </Collapse>
      </Fragment>
   )
}
