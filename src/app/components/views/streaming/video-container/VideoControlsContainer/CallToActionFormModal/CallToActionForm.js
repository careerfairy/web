import PropTypes from "prop-types";
import {
   Box,
   Button,
   Collapse,
   DialogActions,
   DialogContent,
   FormControl,
   FormHelperText,
   Grid,
   MenuItem,
   Select,
   TextField,
   Typography,
} from "@material-ui/core";
import React, { memo, useContext, useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { URL_REGEX } from "components/util/constants";
import { useFormik } from "formik";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { useFirebase } from "context/firebase";
import useStreamRef from "components/custom-hook/useStreamRef";
import { DateTimePicker } from "@material-ui/pickers";
import { callToActionSocialsArray } from "../../../../../util/constants/callToActions";
import TutorialContext from "../../../../../../context/tutorials/TutorialContext";
import { StyledTooltipWithButton } from "../../../../../../materialUI/GlobalTooltips";
import { enqueueJobPostingCta } from "store/actions";
import { v4 as uuid } from "uuid";
import { useAuth } from "../../../../../../HOCs/AuthProvider";
import { jobDescription } from "./exampleFormData";
import useSliderFullyOpened from "../../../../../custom-hook/useSliderFullyOpened";

const MAX_BUTTON_TEXT_LENGTH = 45;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_JOB_TITLE_LENGTH = 1000;
const MAX_SALARY_LENGTH = 200;

const getMaxLengthError = (maxLength) => [
   maxLength,
   `This value is too long. It should have ${maxLength} characters or fewer.`,
];

const now = new Date();
const validationSchema = (type) =>
   yup.object({
      message: yup
         .string("Enter your message")
         .max(...getMaxLengthError(MAX_MESSAGE_LENGTH)),
      buttonText: yup
         .string("Enter the button text")
         .max(...getMaxLengthError(MAX_BUTTON_TEXT_LENGTH))
         .required("This value is required"),
      buttonUrl: yup
         .string("Enter the call to action url")
         .matches(URL_REGEX, { message: "Must be a valid url" })
         .required("Must be a valid url"),
      imageUrl: yup
         .string("Enter the image url")
         .matches(URL_REGEX, { message: "Must be a valid url" }),
      jobData: yup.object().shape({
         jobTitle:
            type === "jobPosting"
               ? yup
                    .string()
                    .max(...getMaxLengthError(MAX_JOB_TITLE_LENGTH))
                    .required("This value is required")
               : yup.string(),
         salary: yup.string().max(...getMaxLengthError(MAX_SALARY_LENGTH)),
         applicationDeadline: yup
            .date()
            .nullable()
            .min(now, `The date must be in the future`),
      }),
   });

const useStyles = makeStyles((theme) => ({
   dialogContent: {
      overflowY: "hidden",
   },
   socialMenuItemBox: {
      "& svg": {
         marginRight: "0.5em",
      },
   },
}));

const CallToActionForm = memo(
   ({
      handleClose,
      isTestStream,
      initialValues,
      isCustom,
      isJobPosting,
      isSocial,
   }) => {
      const [fullyOpened, onEntered, onExited] = useSliderFullyOpened();

      const { handleConfirmStep, isOpen } = useContext(TutorialContext);
      const isActiveTutorialStep = isOpen(20, isTestStream);

      const streamRef = useStreamRef();
      const classes = useStyles();
      const dispatch = useDispatch();
      const {
         createCallToAction,
         updateCallToAction,
         activateCallToAction,
         clickOnCallToAction,
         dismissCallToAction,
      } = useFirebase();

      const canChangeMessage = useMemo(
         () => Boolean(isCustom || isJobPosting),
         [isCustom, isJobPosting]
      );

      const getInitialValues = (
         isJobPosting,
         isActiveTutorialStep,
         initialValues
      ) => {
         if (isJobPosting && isActiveTutorialStep) {
            return {
               ...initialValues,
               jobData: {
                  salary: "CHF - 82'000",
                  jobTitle: "Mechanical Engineer",
               },
               buttonUrl: "https://www.linkedin.com/jobs/",
               message: jobDescription,
            };
         }
         return { ...initialValues };
      };

      const formik = useFormik({
         initialValues: getInitialValues(
            isJobPosting,
            isActiveTutorialStep,
            initialValues
         ),
         enableReinitialize: true,
         validationSchema: validationSchema(initialValues.type),
         onSubmit: async (values, { setSubmitting }) => {
            try {
               setSubmitting(true);
               if (values.isToBeSaved) {
                  await handleSave(values);
               } else {
                  await handleSend(values);
               }

               if (isActiveTutorialStep) {
                  handleConfirmStep(20);
               }
            } catch (e) {
               dispatch(actions.sendGeneralError(e));
               console.error("-> Error: failed in submitting CTA", e);
            }
            setSubmitting(false);
            handleClose();
         },
      });

      const handleSubmitTutorialJobPosting = async () => {
         try {
            await formik.handleSubmit();
         } catch (e) {
            console.error("-> Error: failed in submitting tutorial CTA", e);
         }
      };

      const handleSend = async (formData) => {
         let values = { ...formData };
         if (values.id) {
            await updateCallToAction(streamRef, values.id, values);
            return await activateCallToAction(streamRef, values.id);
         }
         const callToActionId = await createCallToAction(streamRef, {
            ...values,
            isForTutorial: Boolean(isActiveTutorialStep),
         });
         if (isActiveTutorialStep) {
            const closeSnack = () =>
               dispatch(actions.closeSnackbar(callToActionId));
            const handleDismissCallToAction = async () => {
               await dismissCallToAction(streamRef, callToActionId);
               closeSnack();
            };

            const handleClickCallToAction = async () => {
               await clickOnCallToAction(streamRef, callToActionId);
               closeSnack();
               if (window) {
                  window.open(values.buttonUrl, "_blank");
               }
            };

            dispatch(
               actions.enqueueJobPostingCta(
                  {
                     ...values,
                     id: callToActionId,
                     isForTutorial: true,
                  },
                  handleClickCallToAction,
                  handleDismissCallToAction
               )
            );
         }
         return await activateCallToAction(streamRef, callToActionId);
      };

      const handleSave = async (values) => {
         if (values.id) {
            return await updateCallToAction(streamRef, values.id, values);
         }
         return await createCallToAction(streamRef, values);
      };

      return (
         <React.Fragment>
            <StyledTooltipWithButton
               open={isActiveTutorialStep && fullyOpened}
               tooltipTitle="Share Job Posts (4/8)"
               buttonDisabled={formik.isSubmitting}
               placement="top"
               buttonText="Send Job Posting!"
               onConfirm={handleSubmitTutorialJobPosting}
               tooltipText="Here, we have pre-filled an imaginary job posting for your audience. Go ahead and send this job posting so that your audience can engage with it."
            >
               <DialogContent className={classes.dialogContent}>
                  <Grid container spacing={3}>
                     <Grid
                        xs={12}
                        style={{ padding: !isJobPosting && "0" }}
                        item
                     >
                        <Collapse
                           unmountOnExit
                           in={canChangeMessage && isJobPosting}
                        >
                           <TextField
                              fullWidth
                              variant="outlined"
                              id="jobTitle"
                              name="jobData.jobTitle"
                              disabled={formik.isSubmitting}
                              autoFocus={isJobPosting}
                              inputProps={{
                                 maxLength: MAX_MESSAGE_LENGTH,
                              }}
                              placeholder="Mechanical Engineer"
                              label="Job Title*"
                              value={formik.values.jobData.jobTitle}
                              onChange={formik.handleChange}
                              error={
                                 formik.touched.jobData?.jobTitle &&
                                 Boolean(formik.errors.jobData?.jobTitle)
                              }
                              helperText={
                                 formik.touched.jobData?.jobTitle &&
                                 formik.errors.jobData?.jobTitle
                              }
                           />
                        </Collapse>
                     </Grid>
                     <Grid
                        xs={12}
                        sm={8}
                        style={{ padding: !isJobPosting && "0" }}
                        item
                     >
                        <Collapse
                           unmountOnExit
                           in={canChangeMessage && isJobPosting}
                        >
                           <TextField
                              fullWidth
                              variant="outlined"
                              id="salary"
                              name="jobData.salary"
                              disabled={formik.isSubmitting}
                              autoFocus={isJobPosting}
                              inputProps={{
                                 maxLength: MAX_MESSAGE_LENGTH,
                              }}
                              placeholder="CHF - 82'000"
                              label="Salary"
                              value={formik.values.jobData.salary}
                              onChange={formik.handleChange}
                              error={
                                 formik.touched.jobData?.salary &&
                                 Boolean(formik.errors.jobData?.salary)
                              }
                              helperText={
                                 formik.touched.jobData?.salary &&
                                 formik.errors.jobData?.salary
                              }
                           />
                        </Collapse>
                     </Grid>
                     <Grid
                        xs={12}
                        sm={4}
                        style={{ padding: !isJobPosting && "0" }}
                        item
                     >
                        <Collapse
                           unmountOnExit
                           in={canChangeMessage && isJobPosting}
                        >
                           <DateTimePicker
                              id="applicationDeadline"
                              clearable
                              disablePast
                              label="Application deadline"
                              value={formik.values.jobData.applicationDeadline}
                              name="jobData.applicationDeadline"
                              onChange={(value) => {
                                 const newValue = value
                                    ? new Date(value)
                                    : null;
                                 formik.setFieldValue(
                                    "jobData.applicationDeadline",
                                    newValue,
                                    true
                                 );
                              }}
                              disabled={formik.isSubmitting}
                              minDate={now}
                              inputVariant="outlined"
                              fullWidth
                              error={
                                 formik.touched.jobData?.applicationDeadline &&
                                 Boolean(
                                    formik.errors.jobData?.applicationDeadline
                                 )
                              }
                              helperText={
                                 formik.touched.jobData?.applicationDeadline &&
                                 formik.errors.jobData?.applicationDeadline
                              }
                           />
                        </Collapse>
                     </Grid>
                     <Grid
                        xs={12}
                        style={{ padding: !canChangeMessage && "0" }}
                        item
                     >
                        <Collapse
                           onEntered={onEntered}
                           onExited={onExited}
                           unmountOnExit
                           in={canChangeMessage}
                        >
                           <TextField
                              fullWidth
                              variant="outlined"
                              id="message"
                              name="message"
                              disabled={formik.isSubmitting}
                              multiline
                              autoFocus
                              minRows={3}
                              maxRows={12}
                              inputProps={{
                                 maxLength: MAX_MESSAGE_LENGTH,
                              }}
                              placeholder="Click here to see our open positions"
                              label={
                                 isJobPosting ? "Job Description" : "message"
                              }
                              value={formik.values.message}
                              onChange={formik.handleChange}
                              error={
                                 formik.touched.message &&
                                 Boolean(formik.errors.message)
                              }
                              helperText={
                                 formik.touched.message && formik.errors.message
                              }
                           />
                        </Collapse>
                     </Grid>
                     <Grid xs={12} style={{ padding: !isCustom && "0" }} item>
                        <Collapse unmountOnExit in={isCustom}>
                           <TextField
                              fullWidth
                              variant="outlined"
                              disabled={formik.isSubmitting}
                              id="buttonText"
                              inputProps={{
                                 maxLength: MAX_BUTTON_TEXT_LENGTH,
                              }}
                              placeholder="Click Here"
                              name="buttonText"
                              label="Button Text*"
                              value={formik.values.buttonText}
                              onChange={formik.handleChange}
                              error={
                                 formik.touched.buttonText &&
                                 Boolean(formik.errors.buttonText)
                              }
                              helperText={
                                 formik.touched.buttonText &&
                                 formik.errors.buttonText
                              }
                           />
                        </Collapse>
                     </Grid>
                     <Grid
                        xs={12}
                        sm={isSocial ? 4 : 12}
                        style={{ padding: !isSocial && "0" }}
                        item
                     >
                        <Collapse unmountOnExit in={isSocial}>
                           <FormControl fullWidth variant="outlined">
                              <Select
                                 value={
                                    formik.values.socialData?.socialType ||
                                    callToActionSocialsArray[0].socialType
                                 }
                                 onChange={formik.handleChange}
                                 displayEmpty
                                 id="socialData"
                                 name="socialData.socialType"
                                 inputProps={{
                                    "aria-label": "Social type selector",
                                 }}
                              >
                                 {callToActionSocialsArray.map((social) => (
                                    <MenuItem
                                       key={social.socialType}
                                       value={social.socialType}
                                    >
                                       <Box
                                          display="flex"
                                          flexWrap="no-wrap"
                                          justifyContent="center"
                                          alignItems="center"
                                          height={20}
                                          className={classes.socialMenuItemBox}
                                       >
                                          {social.icon}
                                          <Typography>{social.name}</Typography>
                                       </Box>
                                    </MenuItem>
                                 ))}
                              </Select>
                           </FormControl>
                        </Collapse>
                     </Grid>
                     <Grid xs={12} sm={isSocial ? 8 : 12} item>
                        <TextField
                           fullWidth
                           variant="outlined"
                           id="buttonUrl"
                           name="buttonUrl"
                           disabled={formik.isSubmitting}
                           placeholder="https://mywebsite.com/careers/"
                           label={`${initialValues.title} Url*`}
                           value={formik.values.buttonUrl}
                           onChange={formik.handleChange}
                           error={
                              formik.touched.buttonUrl &&
                              Boolean(formik.errors.buttonUrl)
                           }
                           helperText={
                              formik.touched.buttonUrl &&
                              formik.errors.buttonUrl
                           }
                        />
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions>
                  <Button
                     disabled={formik.isSubmitting || isActiveTutorialStep}
                     onClick={async () => {
                        await formik.setFieldValue("isToBeSaved", true);
                        await formik.handleSubmit();
                     }}
                     variant="outlined"
                     color="secondary"
                  >
                     {initialValues.id ? "Update" : "Save"}
                  </Button>
                  <Button
                     disabled={formik.isSubmitting}
                     onClick={async () => {
                        await formik.setFieldValue("isToBeSaved", false);
                        await formik.handleSubmit();
                     }}
                     variant="contained"
                     color="primary"
                  >
                     Send now
                  </Button>
               </DialogActions>
            </StyledTooltipWithButton>
         </React.Fragment>
      );
   }
);

CallToActionForm.propTypes = {
   handleClose: PropTypes.func,
   initialValues: PropTypes.object.isRequired,
   isCustom: PropTypes.bool,
   isJobPosting: PropTypes.bool,
};

export default CallToActionForm;
