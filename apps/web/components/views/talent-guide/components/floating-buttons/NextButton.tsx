import { useAppDispatch } from "components/custom-hook/store"
import { proceedToNextStep } from "store/reducers/talentGuideReducer"
import { useIsLastStep } from "store/selectors/talentGuideSelectors"
import { FinishModuleButton } from "./FinishModuleButton"
import { FloatingButton } from "./FloatingButton"

export const NextButton = () => {
   const isLastStep = useIsLastStep()
   const dispatch = useAppDispatch()

   if (isLastStep) return <FinishModuleButton />

   return (
      <FloatingButton
         color="primary"
         variant="contained"
         onClick={() => {
            dispatch(proceedToNextStep())
         }}
      >
         Next
      </FloatingButton>
   )
}
