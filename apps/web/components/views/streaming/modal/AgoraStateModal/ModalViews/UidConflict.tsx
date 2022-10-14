import React from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import StepsView from "../common/StepsView"

const UidConflict = () => {
   return (
      <Dialog open={true}>
         <DialogTitle>
            You seem to have the stream open on another window:
         </DialogTitle>
         <DialogContent dividers>
            <StepsView stepIds={["uidConflict"]} />
         </DialogContent>
      </Dialog>
   )
}

export default UidConflict
