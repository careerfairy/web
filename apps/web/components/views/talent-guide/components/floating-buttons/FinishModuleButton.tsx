import { useAppDispatch } from "components/custom-hook/store"
import { resetModuleProgressForDemo } from "../../../../../store/reducers/talentGuideReducer"
import { FloatingButton } from "./FloatingButton"
export const FinishModuleButton = () => {
   const dispatch = useAppDispatch()

   return (
      <FloatingButton
         onClick={() => {
            // TODO: Mark module as completed in firestore
            // Currently, we are just resetting the module progress in the firestore/reducer
            dispatch(resetModuleProgressForDemo())
         }}
         color="primary"
         variant="outlined"
      >
         Finish module
      </FloatingButton>
   )
}
