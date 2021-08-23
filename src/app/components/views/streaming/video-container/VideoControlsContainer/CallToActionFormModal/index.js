import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Box,
   Dialog,
   DialogTitle,
   IconButton,
   Typography,
} from "@material-ui/core";
import CallToActionForm from "./CallToActionForm";
import CloseIcon from "@material-ui/icons/Close";
import CallToActionTypeMenu from "./CallToActionTypeMenu";
import { callToActionsDictionary } from "../../../../../util/constants/callToActions";

const useStyles = makeStyles((theme) => ({
   closeBtn: {
      marginLeft: "auto",
   },
}));

const {social} = callToActionsDictionary

const defaultInitialValues = {
   message: social.message,
   value: social.value,
   buttonText: social.buttonText,
   title: social.title,
   buttonUrl: "",
   isToBeSaved: false,
   type: social.type,
   id: "",
   imageUrl: "",
   jobData: {
      jobTitle: "",
      salary: "",
      applicationDeadline: null
   },
   socialData:{
      socialType: social.socialTypes.linkedIn.socialType,
   }
};


const CallToActionFormModal = ({ onClose, open, callToActionToEdit }) => {
   const [initialValues, setInitialValues] = useState(defaultInitialValues);

   useEffect(() => {
      if (callToActionToEdit) {
         const newInitialValues = {
            message: callToActionToEdit.message,
            color:
               callToActionsDictionary[callToActionToEdit.type]?.color || defaultInitialValues.color,
            value:
              callToActionsDictionary[callToActionToEdit.type]?.value || defaultInitialValues.value,
            buttonUrl: callToActionToEdit.buttonUrl || "",
            type: callToActionToEdit.type,
            id: callToActionToEdit.id,
            buttonText: callToActionToEdit.buttonText,
            isToBeSaved: true,
            imageUrl: callToActionToEdit.imageUrl || "",
            title:
              callToActionsDictionary[callToActionToEdit.type]?.title || defaultInitialValues.title,
            jobData: {
               jobTitle: callToActionToEdit.jobData?.jobTitle || "",
               salary: callToActionToEdit.jobData?.salary || "",
               applicationDeadline:
                  callToActionToEdit.jobData?.applicationDeadline?.toDate?.() || null,
            },
            socialData:{
               socialType: callToActionToEdit.socialData?.socialType || defaultInitialValues.socialData.socialType
            }
         };
         setInitialValues(newInitialValues);
      } else {
         setInitialValues({ ...defaultInitialValues });
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
      newValue,
      newColor,
      newTitle,
   }) => {
      setInitialValues({
         ...defaultInitialValues,
         type: newType,
         message: newMessage,
         buttonText: newButtonText,
         value: newValue,
         color: newColor,
         title: newTitle,
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
                     {initialValues.id
                        ? "Update call to action"
                        : "Create a call to action and promote your"}
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
            initialValues={initialValues}
            handleSetCallToActionType={handleSetCallToActionType}
         />
         <CallToActionForm
            initialValues={initialValues}
            isSocial={initialValues.type === "social"}
            handleClose={handleClose}
            isCustom={initialValues.type === "custom"}
            isJobPosting={initialValues.type === "jobPosting"}
         />
      </Dialog>
   );
};

CallToActionFormModal.propTypes = {
   callToActionToEdit: PropTypes.shape({
      buttonText: PropTypes.string,
      buttonUrl: PropTypes.string,
      id: PropTypes.string,
      message: PropTypes.string,
      type: PropTypes.string,
   }),
   onClose: PropTypes.func.isRequired,
   open: PropTypes.bool.isRequired,
};

export default CallToActionFormModal;
