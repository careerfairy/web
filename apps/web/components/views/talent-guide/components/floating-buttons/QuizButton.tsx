import { TalentGuideQuiz } from "@careerfairy/shared-lib/talent-guide"
import { useAppDispatch } from "components/custom-hook/store"
import { QuizModelType } from "data/hygraph/types"
import {
   attemptQuiz,
   proceedToNextStep,
} from "store/reducers/talentGuideReducer"
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
   },
})

type Props = {
   quiz: QuizModelType
   quizStatus: Pick<TalentGuideQuiz, "state" | "selectedAnswerIds">
}
export const QuizButton = ({ quiz, quizStatus }: Props) => {
   const dispatch = useAppDispatch()

   return (
      <FloatingButton
         variant="outlined"
         sx={styles.button}
         onClick={() => {
            dispatch(
               attemptQuiz({
                  quizFromHygraph: quiz,
                  selectedAnswerIds: quizStatus.selectedAnswerIds,
               })
            )
            dispatch(proceedToNextStep())
         }}
      >
         Check answer
      </FloatingButton>
   )
}
