import React, { useEffect, useState } from "react";
import {
   Avatar,
   Box,
   Button,
   Collapse,
   DialogActions,
   DialogTitle,
   Grow,
   Step,
   StepLabel,
   Stepper,
   TextField,
   Typography,
} from "@material-ui/core";
import { GlassDialog } from "materialUI/GlobalModals";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { useFirestore } from "react-redux-firebase";
import {
   FORTY_FIVE_MINUTES_IN_MILLISECONDS,
   UPCOMING_LIVESTREAMS_NAME,
} from "../../../../../data/constants/streamContants";
import { useSelector } from "react-redux";
import { Autocomplete } from "@material-ui/lab";
import clsx from "clsx";
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";
import dayjs from "dayjs";
import EmailTemplateCard from "./EmailTemplateCard";
import templates from "./templates";
import EmailTemplateForm from "./EmailTemplateForm";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
   },
   backButton: {
      marginRight: theme.spacing(1),
   },
   instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
   },
   streamCompanyLogo: {
      width: 60,
      height: 60,
      background: theme.palette.common.white,
      boxShadow: theme.shadows[2],
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   groupLogoStacked: {
      width: 60,
      height: 60,
   },
   optionViewRoot: {
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(1),
      borderBottom: `2px solid ${alpha(theme.palette.common.black, 0.5)}`,
      width: "100%",
   },
   preview: {
      border: `2px solid ${alpha(theme.palette.common.black, 0.5)}`,
      borderRadius: theme.spacing(1),
   },
   optionDetailsWrapper: {
      display: "flex",
      flexWrap: "nowrap",
      width: "100%",
   },
   streamInfoWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: theme.spacing(0.5),
   },
}));

function getSteps() {
   return [
      "Select an event you wish to promote",
      "Select your template",
      "Finalize your template",
   ];
}
const GroupOptionView = ({ streamData = {}, preview }) => {
   const classes = useStyles();
   return (
      <div
         className={clsx(classes.optionViewRoot, {
            [classes.preview]: preview,
         })}
      >
         <Typography variant="subtitle1" gutterBottom>
            {streamData?.title}
         </Typography>
         <div className={classes.optionDetailsWrapper}>
            <Avatar
               variant="square"
               className={clsx(classes.streamCompanyLogo)}
               alt={streamData?.companyLogoUrl}
               src={getResizedUrl(streamData?.companyLogoUrl, "xs")}
            />
            <div className={classes.streamInfoWrapper}>
               <Typography variant="body2" gutterBottom color="textSecondary">
                  {dayjs(streamData?.start?.toDate?.()).format("YYYY MMM, DD")}
               </Typography>
               <Typography variant="body1">{streamData?.company}</Typography>
            </div>
         </div>
      </div>
   );
};

const EventSelectView = ({
   handleClose,
   handleNext,
   targetStream,
   setTargetStream,
}) => {
   const upcomingStreams = useSelector(
      (state) => state.firestore.ordered[UPCOMING_LIVESTREAMS_NAME] || []
   );
   const [inputValue, setInputValue] = useState("");

   return (
      <>
         <Box p={2}>
            <Collapse in={Boolean(targetStream)} unmountOnExit>
               <Box mb={2}>
                  <GroupOptionView preview streamData={targetStream} />
               </Box>
            </Collapse>
            <Autocomplete
               value={targetStream}
               onChange={(event, newValue) => {
                  setTargetStream(newValue);
               }}
               inputValue={inputValue}
               onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue);
               }}
               getOptionSelected={(option, value) =>
                  option.title === value.title ||
                  option.company === value.company
               }
               getOptionLabel={(option) => option.title || ""}
               id="event-select-menu"
               renderOption={(option) => (
                  <GroupOptionView streamData={option} />
               )}
               options={upcomingStreams}
               fullWidth
               renderInput={(params) => (
                  <TextField
                     {...params}
                     label="Chose an Event"
                     variant="outlined"
                  />
               )}
            />
         </Box>
         <DialogActions>
            <Box marginRight="auto">
               <Button onClick={handleClose} children={"Close"} />
            </Box>
            {targetStream && (
               <Button variant="contained" color="primary" onClick={handleNext}>
                  Continue
               </Button>
            )}
         </DialogActions>
      </>
   );
};

const TemplateSelectView = ({
   handleClose,
   handleBack,
   setTargetTemplate,
   targetTemplate,
   handleNext,
}) => {
   return (
      <>
         <DialogTitle>Choose a template</DialogTitle>
         <Box display="flex" justifyContent="center" p={1}>
            {templates.map((template) => (
               <EmailTemplateCard
                  key={template.templateName}
                  selected={
                     template.templateImageUrl ===
                     targetTemplate?.templateImageUrl
                  }
                  onClick={() => setTargetTemplate(template)}
                  templateImageUrl={template.templateImageUrl}
                  templateName={template.templateName}
               />
            ))}
         </Box>
         <DialogActions>
            <Box marginRight="auto">
               <Button onClick={handleClose} children={"Close"} />
            </Box>
            <Button onClick={handleBack} children={"back"} />
            {targetTemplate && (
               <Button
                  onClick={handleNext}
                  color="primary"
                  variant="contained"
                  children={"Next"}
               />
            )}
         </DialogActions>
      </>
   );
};

const TemplateFinalizeView = (props) => {
   return <EmailTemplateForm {...props} />;
};

function getStepContent(stepIndex, props) {
   switch (stepIndex) {
      case 0:
         return <EventSelectView {...props} />;
      case 1:
         return <TemplateSelectView {...props} />;
      case 2:
         return <TemplateFinalizeView {...props} />;
      default:
         return "Unknown stepIndex";
   }
}
const targetTime = new Date(Date.now() - FORTY_FIVE_MINUTES_IN_MILLISECONDS);

const Content = ({ handleClose, emails }) => {
   const classes = useStyles();
   const firestore = useFirestore();
   const [activeStep, setActiveStep] = useState(0);
   const [targetStream, setTargetStream] = useState(null);
   const [targetTemplate, setTargetTemplate] = useState(null);
   const steps = getSteps();

   useEffect(() => {
      (async function () {
         await firestore.get({
            collection: "livestreams",
            where: [
               ["start", ">", targetTime],
               ["test", "==", false],
            ],
            orderBy: ["start", "asc"],
            storeAs: UPCOMING_LIVESTREAMS_NAME,
         });
      })();
   }, []);

   useEffect(() => {
      // if no event is selected please stay on the first step
      if (!targetStream) handleReset();
   }, [Boolean(targetStream)]);

   const handleNext = () => {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
   };

   const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
   };

   const handleReset = () => {
      setActiveStep(0);
   };
   return (
      <>
         <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
               <Step key={label}>
                  <StepLabel>{label}</StepLabel>
               </Step>
            ))}
         </Stepper>
         {getStepContent(activeStep, {
            handleClose,
            handleBack,
            handleNext,
            targetStream,
            setTargetStream,
            setTargetTemplate,
            targetTemplate,
            emails,
         })}
      </>
   );
};
const SendEmailTemplateDialog = ({ open, onClose, emails }) => {
   const handleClose = () => {
      onClose();
   };

   return (
      <GlassDialog scroll="body" TransitionComponent={Grow} open={open}>
         <Content emails={emails} handleClose={handleClose} />
      </GlassDialog>
   );
};

export default SendEmailTemplateDialog;
