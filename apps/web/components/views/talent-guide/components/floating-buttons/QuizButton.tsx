import {
   QUIZ_STATE,
   TalentGuideQuiz,
} from "@careerfairy/shared-lib/talent-guide"
import { useAppDispatch } from "components/custom-hook/store"
import { QuizModelType } from "data/hygraph/types"
import { attemptQuiz } from "store/reducers/talentGuideReducer"
import { useQuizState } from "store/selectors/talentGuideSelectors"
import { sxStyles } from "types/commonTypes"
import { FloatingButton } from "./FloatingButton"

const styles = sxStyles({
   button: {
      backgroundColor: (theme) => theme.brand.black[900],
      borderColor: (theme) => theme.palette.primary.main,
      "&:hover, &:focus": {
         backgroundColor: (theme) => theme.brand.black[900],
         borderColor: (theme) => theme.palette.primary.main,
      },
      "&:disabled": {
         backgroundColor: undefined,
         borderColor: undefined,
      },
   },
})

type Props = {
   quiz: QuizModelType
   quizStatus: Pick<TalentGuideQuiz, "state" | "selectedAnswerIds">
}
export const QuizButton = ({ quiz, quizStatus }: Props) => {
   const dispatch = useAppDispatch()
   const quizState = useQuizState(quiz.id)

   const quizHasBeenAttempted = quizState.state !== QUIZ_STATE.NOT_ATTEMPTED
   const hasSelectedAnswers = quizStatus.selectedAnswerIds.length > 0
   const isDisabled = quizHasBeenAttempted ? false : !hasSelectedAnswers

   return (
      <FloatingButton
         variant={isDisabled ? "contained" : "outlined"}
         sx={styles.button}
         disabled={isDisabled}
         onClick={() => {
            dispatch(
               attemptQuiz({
                  quizFromHygraph: quiz,
                  selectedAnswerIds: quizStatus.selectedAnswerIds,
               })
            )
         }}
      >
         Check answer
      </FloatingButton>
   )
}
