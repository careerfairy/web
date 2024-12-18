import RefreshIcon from "@mui/icons-material/RestartAlt"
import { Fab, Tooltip } from "@mui/material"
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
      "&:hover": {
         transform: "rotate(45deg)",
      },
   },
})

export const ResetDemoButton = () => {
   const dispatch = useAppDispatch()

   return (
      <Tooltip title="Reset demo">
         <Fab
            size="small"
            sx={styles.root}
            onClick={() => {
               // Reset the module progress in the firestore/reducer
               dispatch(resetModuleProgressForDemo())
            }}
            color="secondary"
            variant="extended"
         >
            <RefreshIcon />
         </Fab>
      </Tooltip>
   )
}
