import { useAppDispatch } from "components/custom-hook/store"
import { proceedToNextStep } from "store/reducers/talentGuideReducer"
import { useIsCompletingModule } from "store/selectors/talentGuideSelectors"
import { FloatingButton } from "./FloatingButton"

export const FinishModuleButton = () => {
   const dispatch = useAppDispatch()
   const isCompletingModule = useIsCompletingModule()
   return (
      <FloatingButton
         onClick={() => {
            dispatch(proceedToNextStep())
         }}
         color="primary"
         variant="outlined"
         loading={isCompletingModule}
      >
         Finish module
      </FloatingButton>
   )
}
