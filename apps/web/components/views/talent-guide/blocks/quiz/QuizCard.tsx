import { QUIZ_STATE } from "@careerfairy/shared-lib/talent-guide/types"
import { Box, Collapse, Stack, Typography } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { QuizModelType } from "data/hygraph/types"
import { Fragment } from "react"
import { toggleQuizAnswer } from "store/reducers/talentGuideReducer"
import { useQuizState } from "store/selectors/talentGuideSelectors"
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

type Props = QuizModelType

export const QuizCard = ({ question, correction, answers, id }: Props) => {
   const quizState = useQuizState(id)
   console.log("🚀 ", {
      quizState,
      answers,
   })
   const dispatch = useAppDispatch()

   const quizHasBeenAttempted =
      quizState.state === QUIZ_STATE.PASSED ||
      quizState.state === QUIZ_STATE.FAILED

   const handleButtonClick = (answerId: string) => {
      dispatch(toggleQuizAnswer({ quizId: id, answerId }))
   }

   return (
      <Fragment>
         <Stack direction="column" spacing={1.5}>
            <Typography variant="mobileBrandedH4" sx={styles.question}>
               {question}
            </Typography>
            {answers.map(({ answer, id }) => (
               <AnswerButton
                  key={id}
                  onClick={() => handleButtonClick(id)}
                  disabled={quizHasBeenAttempted}
                  variant={getAnswerVariant(
                     quizHasBeenAttempted,
                     answers.find((a) => a.id === id)?.isCorrect || false,
                     quizState.selectedAnswerIds.includes(id)
                  )}
               >
                  {answer}
               </AnswerButton>
            ))}
         </Stack>
         <Collapse in={quizState.state === QUIZ_STATE.FAILED} unmountOnExit>
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

const getAnswerVariant = (
   quizHasBeenAttempted: boolean,
   isCorrect: boolean,
   isSelected: boolean
): AnswerVariant => {
   if (quizHasBeenAttempted) {
      if (isCorrect) return "correct"
      if (isSelected && !isCorrect) return "wrong"
      if (!isSelected && isCorrect) return "correction"

      return "default"
   }

   if (isSelected) return "selected"

   return "default"
}
