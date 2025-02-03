import { useAppDispatch } from "components/custom-hook/store"
import { proceedToNextStep } from "store/reducers/talentGuideReducer"
import { useIsLastStep } from "store/selectors/talentGuideSelectors"
import { FinishLevelButton } from "./FinishLevelButton"
import { FloatingButton } from "./FloatingButton"

export const NextButton = () => {
   const isLastStep = useIsLastStep()
   const dispatch = useAppDispatch()

   if (isLastStep) return <FinishLevelButton />

   return (
      <FloatingButton
         color="primary"
         variant="contained"
         onClick={() => {
            dispatch(proceedToNextStep())
         }}
      >
         Weiter
      </FloatingButton>
   )
}
