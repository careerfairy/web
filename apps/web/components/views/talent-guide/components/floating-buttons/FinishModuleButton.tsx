import { useAppDispatch } from "components/custom-hook/store"
import { resetSteps } from "store/reducers/talentGuideReducer"
import { FloatingButton } from "./FloatingButton"

export const FinishModuleButton = () => {
   const dispatch = useAppDispatch()

   return (
      <FloatingButton
         onClick={() => {
            // TODO: Mark module as completed in firestore
            dispatch(resetSteps())
         }}
         color="primary"
         variant="outlined"
      >
         Finish module
      </FloatingButton>
   )
}
