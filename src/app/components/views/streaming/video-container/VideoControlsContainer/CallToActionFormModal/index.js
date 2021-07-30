import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Dialog, DialogTitle, IconButton } from "@material-ui/core";
import CustomCallToActionForm from "./CustomCallToActionForm";
import CloseIcon from "@material-ui/icons/Close";
import ContextualCallToActionForm from "./ContextualCallToActionForm";
import CallToActionTypeMenu from "./CallToActionTypeMenu";

const useStyles = makeStyles((theme) => ({
   closeBtn: {
      marginLeft: "auto",
   },
}));

const CallToActionFormModal = ({ onClose, open }) => {
   const [initialValues, setInitialValues] = useState({
      message: "",
      buttonText: "",
      buttonUrl: "",
      isToBeSaved: false,
      type: "",
   });

   const classes = useStyles();
   const handleClose = () => {
      onClose();
   };

   return (
      <Dialog maxWidth="md" fullWidth onClose={handleClose} open={open}>
         <DialogTitle>
            <Box display="flex" alignItems="center">
               <Box flexGrow={1}>Create call to action</Box>
               <Box>
                  <IconButton onClick={handleClose}>
                     <CloseIcon />
                  </IconButton>
               </Box>
            </Box>
         </DialogTitle>
         <CallToActionTypeMenu/>
         {/*<ContextualCallToActionForm*/}
         {/*   initialValues={initialValues}*/}
         {/*   handleClose={handleClose}*/}
         {/*/>*/}
         {/*<CustomCallToActionForm*/}
         {/*   initialValues={initialValues}*/}
         {/*   handleClose={handleClose}*/}
         {/*/>*/}
      </Dialog>
   );
};

export default CallToActionFormModal;
