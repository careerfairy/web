import React, { useEffect } from "react"
import Dialog from "@mui/material/Dialog"
import { useVideo } from "react-use"
import Box from "@mui/material/Box"
import Slide from "@mui/material/Slide"
import CloseIcon from "@mui/icons-material/Close"
import {
   DialogContent,
   DialogContentText,
   DialogTitle,
   IconButton,
} from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import NoAccessView from "../common/NoAccessView"
import { Highlights_NoAccess } from "../../../constants/contextInfoCareerSkills"

const styles = sxStyles({
   root: {},
   closeIconButton: {
      position: "absolute",
      top: "11px",
      right: "5px",
   },
})
const HighlightsRestrictedDialog = ({
   handleClose,
   open,
   timeLeft,
   timeoutDuration,
}: HighlightsRestrictedDialogProps) => {
   const onClose = () => {
      handleClose()
   }

   return (
      <Dialog
         onClose={onClose}
         TransitionComponent={Slide}
         maxWidth={"lg"}
         fullWidth
         open={open}
      >
         <DialogTitle>
            Oops! You don't have access to these highlights yet...
         </DialogTitle>
         <IconButton sx={styles.closeIconButton} onClick={onClose} autoFocus>
            <CloseIcon color={"inherit"} />
         </IconButton>
         <DialogContent>
            <NoAccessView contextInfoMapKey={Highlights_NoAccess} />
            <DialogContentText>
               {`You can only watch highlights once per ${
                  timeoutDuration / 1000
               } seconds. You have ${Math.round(
                  timeLeft / 1000
               )} seconds left.`}
            </DialogContentText>
         </DialogContent>
      </Dialog>
   )
}

interface HighlightsRestrictedDialogProps {
   handleClose: () => void
   open: boolean
   timeLeft: number
   timeoutDuration: number
}

export default HighlightsRestrictedDialog
