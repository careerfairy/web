import { useAppDispatch } from "components/custom-hook/store"
import { QuizModelType } from "data/hygraph/types"
import { proceedToNextStep } from "store/reducers/talentGuideReducer"
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
}
export const QuizButton = ({ quiz }: Props) => {
   const dispatch = useAppDispatch()

   return (
      <FloatingButton
         variant="outlined"
         sx={styles.button}
         onClick={() => {
            alert(
               `Skipping quiz "${quiz.question}" and proceeding to next step (TODO)`
            )
            // TODO: Mark quiz as completed in firestore
            dispatch(proceedToNextStep())
         }}
      >
         Check answer
      </FloatingButton>
   )
}
