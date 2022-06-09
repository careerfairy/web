import React from "react"
import Dialog from "@mui/material/Dialog"
import Slide from "@mui/material/Slide"
import CloseIcon from "@mui/icons-material/Close"
import { DialogContent, DialogContentText, IconButton } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import NoAccessView from "../common/NoAccessView"
import {
   ContextInfoMap,
   Highlights_NoAccess,
} from "../../../constants/contextInfoCareerSkills"
import { convertMillisecondsToTime } from "../../../util/CommonUtil"

const styles = sxStyles({
   root: {},
   closeIconButton: {
      position: "absolute",
      top: "8px",
      right: "8px",
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
   const requiredBadge = ContextInfoMap[Highlights_NoAccess].badgeRequired

   return (
      <Dialog
         onClose={onClose}
         TransitionComponent={Slide}
         maxWidth={"md"}
         fullWidth
         open={open}
      >
         <IconButton sx={styles.closeIconButton} onClick={onClose} autoFocus>
            <CloseIcon color={"inherit"} />
         </IconButton>
         <DialogContent>
            <NoAccessView contextInfoMapKey={Highlights_NoAccess} />
            <DialogContentText
               dangerouslySetInnerHTML={{
                  __html: `Since you dont have the <b>${
                     requiredBadge.name
                  } level ${
                     requiredBadge.level
                  } badge</b>, you can only watch highlights once per <b>${convertMillisecondsToTime(
                     timeoutDuration
                  )}</b>.You can watch another highlight in <b>${convertMillisecondsToTime(
                     timeLeft
                  )}</b>.`,
               }}
               textAlign={"center"}
            />
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
