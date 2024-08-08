import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
} from "@mui/material"
import { Fragment } from "react"

type Props = {
   action?: string
   confirmText: string
   onConfirm: () => void
   onclose: () => void
   open: boolean
}

const ConfirmRecordingDialog = ({
   action,
   confirmText,
   onConfirm,
   onclose,
   open,
}: Props) => {
   const handleConfirm = () => {
      onConfirm()
      onclose()
   }

   return (
      <Fragment>
         <Dialog open={open} onClose={() => onclose()}>
            <DialogTitle>Confirm {action}</DialogTitle>
            <DialogContent>{confirmText}</DialogContent>
            <DialogActions>
               <Button color="grey" onClick={() => onclose()}>
                  Cancel
               </Button>
               <Button color="primary" onClick={handleConfirm}>
                  Confirm
               </Button>
            </DialogActions>
         </Dialog>
      </Fragment>
   )
}

export default ConfirmRecordingDialog
