import PropTypes from 'prop-types'
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Box,
   Dialog,
   DialogTitle,
   IconButton,
   Typography,
} from "@material-ui/core";
import CustomCallToActionForm from "./CustomCallToActionForm";
import CloseIcon from "@material-ui/icons/Close";
import ContextualCallToActionForm from "./ContextualCallToActionForm";
import CallToActionTypeMenu from "./CallToActionTypeMenu";

const useStyles = makeStyles((theme) => ({
   closeBtn: {
      marginLeft: "auto",
   },
}));

const defaultInitialValues = {
   message: "",
   buttonText: "",
   buttonUrl: "",
   isToBeSaved: false,
   type: "",
   id: "",
};
const CallToActionFormModal = ({ onClose, open, callToActionToEdit }) => {
   const [initialValues, setInitialValues] = useState(defaultInitialValues);
   console.log("-> initialValues", initialValues);

   useEffect(() => {
      if (callToActionToEdit) {
         setInitialValues({
            message: callToActionToEdit.message,
            buttonUrl: callToActionToEdit.buttonUrl,
            type: callToActionToEdit.type,
            id: callToActionToEdit.id,
            buttonText: callToActionToEdit.buttonText,
            isToBeSaved: true,
         });
      }
   }, [callToActionToEdit]);

   const classes = useStyles();
   const handleClose = () => {
      onClose();
   };

   const handleSetCallToActionType = ({
      newType,
      newMessage,
      newButtonText,
      newButtonUrl,
   }) => {
      setInitialValues({
         ...defaultInitialValues,
         type: newType,
         message: newMessage,
         buttonText: newButtonText,
         buttonUrl: newButtonUrl,
      });
   };

   const handleBack = () => {
      handleReset();
   };
   const handleReset = () => {
      setInitialValues(defaultInitialValues);
   };

   return (
      <Dialog maxWidth="md" fullWidth onClose={handleClose} open={open}>
         <DialogTitle>
            <Box display="flex" alignItems="center">
               <Box flexGrow={1}>
                  <Typography variant="h4">
                     {initialValues.type
                        ? "Create call to action"
                        : "Chose a type of call to action"}
                  </Typography>
               </Box>
               <Box>
                  <IconButton onClick={handleClose}>
                     <CloseIcon />
                  </IconButton>
               </Box>
            </Box>
         </DialogTitle>
         <CallToActionTypeMenu
            handleSetCallToActionType={handleSetCallToActionType}
         />
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

CallToActionFormModal.propTypes = {
  callToActionToEdit: PropTypes.shape({
    buttonText: PropTypes.string,
    buttonUrl: PropTypes.string,
    id: PropTypes.string,
    message: PropTypes.string,
    type: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
}

export default CallToActionFormModal;

