import PropTypes from "prop-types";
import {
   Button,
   Collapse,
   DialogActions,
   DialogContent,
   Grid,
   TextField,
} from "@material-ui/core";
import React, { useMemo } from "react";
import * as yup from "yup";
import { URL_REGEX } from "components/util/constants";
import { useFormik } from "formik";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { useFirebase } from "context/firebase";
import useStreamRef from "components/custom-hook/useStreamRef";

const MAX_BUTTON_TEXT_LENGTH = 45;
const MAX_MESSAGE_LENGTH = 1000;

const getMaxLengthError = (maxLength) => [
   maxLength,
   `This value is too long. It should have ${maxLength} characters or fewer.`,
];

const validationSchema = yup.object({
   message: yup
      .string("Enter your email")
      .max(...getMaxLengthError(MAX_MESSAGE_LENGTH)),
   buttonText: yup
      .string("Enter your password")
      .max(...getMaxLengthError(MAX_BUTTON_TEXT_LENGTH))
      .required("This value is required"),
   buttonUrl: yup
      .string("Enter your password")
      .matches(URL_REGEX, { message: "Must be a valid url" })
      .required("Must be a valid url"),
});

const useStyles = makeStyles((theme) => ({
   dialogContent: {
      overflowY: "hidden",
   },
}));

const CallToActionForm = ({
   handleClose,
   initialValues,
   isCustom,
   isJobPosting,
}) => {
   console.log("-> initialValues in form", initialValues);
   const streamRef = useStreamRef();
   const classes = useStyles();
   const dispatch = useDispatch();
   const {
      createCallToAction,
      updateCallToAction,
      activateCallToAction,
   } = useFirebase();

   const canChangeMessage = useMemo(() => Boolean(isCustom || isJobPosting), [
      isCustom,
      isJobPosting,
   ]);

   const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      validationSchema: validationSchema,
      onSubmit: async (values, { setSubmitting }) => {
         try {
            setSubmitting(true);
            if (values.isToBeSaved) {
               await handleSave(values);
            } else {
               await handleSend(values);
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
            console.error("-> Error: failed in submitting CTA", e);
         }
         setSubmitting(false);
         handleClose();
      },
   });

   const handleSend = async (values) => {
      const callToActionId = await createCallToAction(streamRef, values);
      return await activateCallToAction(streamRef, callToActionId);
   };
   const handleSave = async (values) => {
      if(values.id){
         return await updateCallToAction(streamRef, values.id, values)
      }
      return await createCallToAction(streamRef, values);
   };

   return (
      <React.Fragment>
         <DialogContent className={classes.dialogContent}>
            <Grid container spacing={3} component="form">
               <Grid xs={12} style={{ padding: !canChangeMessage && "0" }} item>
                  <Collapse unmountOnExit in={canChangeMessage}>
                     <TextField
                        fullWidth
                        variant="outlined"
                        id="message"
                        name="message"
                        disabled={formik.isSubmitting}
                        multiline
                        autoFocus
                        rows={3}
                        inputProps={{
                           maxLength: MAX_MESSAGE_LENGTH,
                        }}
                        placeholder="Click here to see our open positions"
                        label="message"
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
                           formik.touched.buttonText && formik.errors.buttonText
                        }
                     />
                  </Collapse>
               </Grid>
               <Grid xs={12} item>
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="buttonUrl"
                     name="buttonUrl"
                     disabled={formik.isSubmitting}
                     placeholder="https://mywebsite.com/careers/"
                     label={`${initialValues.title} Button Url*`}
                     // label="Button Url*"
                     value={formik.values.buttonUrl}
                     onChange={formik.handleChange}
                     error={
                        formik.touched.buttonUrl &&
                        Boolean(formik.errors.buttonUrl)
                     }
                     helperText={
                        formik.touched.buttonUrl && formik.errors.buttonUrl
                     }
                  />
               </Grid>
            </Grid>
         </DialogContent>
         <DialogActions>
            <Button
               disabled={formik.isSubmitting}
               onClick={async () => {
                  await formik.setFieldValue("isToBeSaved", true);
                  await formik.handleSubmit();
               }}
               variant="outlined"
               color="secondary"
            >
               Save
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
      </React.Fragment>
   );
};

CallToActionForm.propTypes = {
   handleClose: PropTypes.func,
   initialValues: PropTypes.object.isRequired,
   isCustom: PropTypes.bool,
   isJobPosting: PropTypes.bool,
};

export default CallToActionForm;
