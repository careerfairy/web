import { useAppDispatch } from "components/custom-hook/store"
import { proceedToNextStep } from "store/reducers/talentGuideReducer"
import { useIsLoadingNextStep } from "store/selectors/talentGuideSelectors"
import { FloatingButton } from "./FloatingButton"

export const FinishModuleButton = () => {
   const dispatch = useAppDispatch()
   const isLoadingNextStep = useIsLoadingNextStep()

   return (
      <FloatingButton
         onClick={() => {
            dispatch(proceedToNextStep())
         }}
         color="primary"
         variant="outlined"
         loading={isLoadingNextStep}
      >
         Finish module
      </FloatingButton>
   )
}
