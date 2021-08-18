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
import {
   FACEBOOK_COLOR,
   LINKEDIN_COLOR,
   TWITTER_COLOR,
} from "components/util/colors";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import JobPostingIcon from "@material-ui/icons/Work";
import CustomCtaIcon from "@material-ui/icons/Info";
import { defaultDeadlineDate } from "../../../../../util/constants/callToActions";

const useStyles = makeStyles((theme) => ({
   closeBtn: {
      marginLeft: "auto",
   },
}));

const ctaTypes = [
   {
      icon: <LinkedInIcon />,
      color: LINKEDIN_COLOR,
      title: "LinkedIn",
      type: "linkedIn",
      description:
         "Help promote your LinkedIn page by sending a call to action to your live viewers.",
      buttonText: "Follow now",
      message: "Follow us on LinkedIn",
      value: 0,
   },
   {
      icon: <FacebookIcon />,
      color: FACEBOOK_COLOR,
      title: "Facebook",
      type: "facebook",
      description:
         "Help promote your Facebook page by sending a call to action to your live viewers.",
      buttonText: "Follow now",
      message: "Follow us on Facebook",
      value: 1,
   },
   {
      icon: <TwitterIcon />,
      color: TWITTER_COLOR,
      title: "Twitter",
      type: "twitter",
      description:
         "Help promote your Twitter page by sending a call to action to your live viewers.",
      buttonText: "Follow now",
      message: "Follow us on Twitter",
      value: 2,
   },
   {
      icon: <JobPostingIcon />,
      color: "",
      title: "Job posting",
      type: "jobPosting",
      description:
         "Help promote an open position to your live viewers with a link to the job posting.",
      buttonText: "Apply now",
      message: "Open position",
      value: 3,
   },
   {
      icon: <CustomCtaIcon />,
      color: "primary",
      title: "Custom message",
      type: "custom",
      description:
         "Create a custom call to action with a customized message, button text and link",
      buttonText: "Click here",
      message: "",
      value: 4,
   },
];


const defaultInitialValues = {
   message: ctaTypes[0].message,
   value: ctaTypes[0].value,
   buttonText: ctaTypes[0].buttonText,
   title: ctaTypes[0].title,
   buttonUrl: "",
   isToBeSaved: false,
   type: ctaTypes[0].type,
   id: "",
   imageUrl: "",
   jobData: {
      jobTitle: "",
      salary: "",
      applicationDeadline: null
   },
};

const CallToActionFormModal = ({ onClose, open, callToActionToEdit }) => {
   const [initialValues, setInitialValues] = useState(defaultInitialValues);

   useEffect(() => {
      if (callToActionToEdit) {
         const newInitialValues = {
            message: callToActionToEdit.message,
            color:
               ctaTypes.find(({ type }) => type === callToActionToEdit.type)
                  ?.color || defaultInitialValues.color,
            value:
               ctaTypes.find(({ type }) => type === callToActionToEdit.type)
                  ?.value || defaultInitialValues.value,
            buttonUrl: callToActionToEdit.buttonUrl,
            type: callToActionToEdit.type,
            id: callToActionToEdit.id,
            buttonText: callToActionToEdit.buttonText,
            isToBeSaved: true,
            imageUrl: callToActionToEdit.imageUrl,
            title:
               ctaTypes.find(({ type }) => type === callToActionToEdit.type)
                  ?.title || defaultInitialValues.title,
            jobData: {
               jobTitle: callToActionToEdit.jobData?.jobTitle || "",
               salary: callToActionToEdit.jobData?.salary || "",
               applicationDeadline:
                  callToActionToEdit.jobData?.applicationDeadline?.toDate?.() || null,
            },
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
            ctaTypes={ctaTypes}
         />
         <CallToActionForm
            initialValues={initialValues}
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
