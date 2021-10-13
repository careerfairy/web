import React, { useMemo } from "react";
import { GlassDialog } from "../../../../../materialUI/GlobalModals";
import {
   Button,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import CheckIcon from "@material-ui/icons/Check";

const ConfirmStartStreamingDialog = ({
   open,
   onClose,
   onConfirm,
   confirmDescription,
}) => {
   const handleClose = () => {
      onClose();
   };
   const memorisedState = useMemo(
      () => ({
         // This ensures that at the context of which the button was clicked
         // stays the same even if the stream hasStarted status changes
         // which avoids the random toggles
         performConfirmAction: () => {
            onConfirm();
            handleClose();
         },
         confirmDescription,
      }),
      [open]
   );

   return (
      <GlassDialog open={open} onClose={handleClose}>
         <DialogTitle>Just making sure</DialogTitle>
         <DialogContent>
            <DialogContentText>
               {memorisedState.confirmDescription}
            </DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button startIcon={<ClearIcon />} onClick={handleClose}>
               Cancel
            </Button>
            <Button
               startIcon={<CheckIcon />}
               variant="contained"
               color="primary"
               onClick={memorisedState.performConfirmAction}
            >
               Confirm
            </Button>
         </DialogActions>
      </GlassDialog>
   );
};

export default ConfirmStartStreamingDialog;
