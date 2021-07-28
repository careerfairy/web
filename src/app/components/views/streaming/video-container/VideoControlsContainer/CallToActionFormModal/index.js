import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Box,
   Dialog,
   DialogContent,
   DialogTitle,
   IconButton,
} from "@material-ui/core";
import CallToActionForm from "../CallToActionForm";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
   closeBtn: {
      marginLeft: "auto",
   },
}));

const CallToActionFormModal = ({ onClose, open }) => {
   const classes = useStyles();
   const handleClose = () => {
      onClose();
   };

   return (
      <Dialog onClose={handleClose} open={open}>
         <DialogTitle>
            <Box display="flex" alignItems="center">
               <Box flexGrow={1}>
                  Create call to action
               </Box>
               <Box>
                  <IconButton onClick={handleClose}>
                     <CloseIcon />
                  </IconButton>
               </Box>
            </Box>
         </DialogTitle>
         <CallToActionForm handleClose={handleClose} />
      </Dialog>
   );
};

export default CallToActionFormModal;
