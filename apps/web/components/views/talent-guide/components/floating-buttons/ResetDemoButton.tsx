import { Button, ButtonGroup, Tooltip } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { sxStyles } from "types/commonTypes"
import { resetModuleProgressForDemo } from "../../../../../store/reducers/talentGuideReducer"

const styles = sxStyles({
   root: {
      position: "fixed",
      bottom: 37,
      right: 30,
      zIndex: (theme) => theme.zIndex.drawer + 10,
      p: 0,
      transition: "transform 0.3s ease-in-out",
   },
})

type Props = {
   onResetLayout: () => void
}

export const ResetDemoButton = ({ onResetLayout }: Props) => {
   const dispatch = useAppDispatch()

   return (
      <ButtonGroup
         sx={styles.root}
         variant="outlined"
         aria-label="Basic button group"
         size="small"
      >
         <Tooltip title="Reset UI">
            <Button
               onClick={() => {
                  onResetLayout()
               }}
            >
               UI
            </Button>
         </Tooltip>
         <Tooltip title="Reset DB">
            <Button
               onClick={() => {
                  // Reset the module progress in the firestore/reducer
                  dispatch(resetModuleProgressForDemo())
               }}
            >
               DB
            </Button>
         </Tooltip>
      </ButtonGroup>
   )
}
