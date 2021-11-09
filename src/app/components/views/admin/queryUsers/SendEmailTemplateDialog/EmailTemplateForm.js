import React, { useCallback, useState } from "react";
import { Formik } from "formik";
import {
   Box,
   Button,
   CircularProgress,
   DialogActions,
   Grid,
   Paper,
   TextField,
   Typography,
} from "@material-ui/core";
import { DateTimePicker } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import DateUtil from "../../../../../util/DateUtil";
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import SendTestEmailDialog from "./SendTestEmailDialog";

const now = new Date();

const useStyles = makeStyles((theme) => ({
   actions: {
      padding: theme.spacing(1, 0, 0, 0),
   },
   loaderWrapper: {
      display: "flex",
      position: "absolute",
      width: "90%",
      height: "90%",
      alignItems: "center",
      justifyContent: "center",
   },
}));
const EmailTemplateForm = ({
   handleClose,
   targetTemplate,
   targetStream,
   handleBack,
   emails,
}) => {
   const { userData } = useAuth();
   const classes = useStyles();
   const dispatch = useDispatch();
   const [confirmSendEmailModalData, setConfirmSendEmailModalData] = useState(
      null
   );
   const [
      confirmSendTestEmailModalData,
      setConfirmSendTestEmailModalData,
   ] = useState(null);
   const [testEmails, setTestEmails] = useState([userData.userEmail]);
   const [sendingEmails, setSendingEmails] = useState(false);

   const handleConfirmSendEmail = async (data) => {
      console.log("-> handleConfirmSendEmail data", data);
      try {
         setSendingEmails(true);
         await targetTemplate.sendTemplate(data, userData.userEmail);
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setSendingEmails(false);
      handleCloseSendConfirmEmailModal();
   };

   const handleConfirmSendTestEmail = useCallback(
      async (data) => {
         const dataWithTestEmails = { ...data, emails: testEmails || [] };
         console.log("-> handleConfirmSendTestEmail data", dataWithTestEmails);
         try {
            setSendingEmails(true);
            await targetTemplate.sendTemplate(
               dataWithTestEmails,
               userData.userEmail
            );
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
         setSendingEmails(false);
         handleCloseSendConfirmEmailModal();
      },
      [testEmails]
   );

   const handleCloseSendConfirmEmailModal = () =>
      setConfirmSendEmailModalData(null);
   const handleCloseSendTestEmailModalData = () =>
      setConfirmSendTestEmailModalData(null);

   return (
      <Formik
         initialValues={{
            ...targetTemplate.getInitialValues(targetStream),
            isTestEmail: false,
         }}
         enableReinitialize
         validationSchema={targetTemplate.validationSchema}
         onSubmit={async (values, { setSubmitting }) => {
            try {
               const data = {
                  values: { ...values },
                  emails,
               };
               if (values.isTestEmail) {
                  // open test email modal
                  setConfirmSendTestEmailModalData(data);
               } else {
                  setConfirmSendEmailModalData(data);
               }
            } catch (e) {
               dispatch(actions.sendGeneralError(e));
            }
            setSubmitting(false);
         }}
      >
         {(formik) => {
            return (
               <>
                  <Box p={1} position="relative">
                     {formik.isSubmitting && (
                        <div className={classes.loaderWrapper}>
                           <CircularProgress />
                        </div>
                     )}
                     <Box component={Paper} p={2}>
                        <Typography variant="h5" gutterBottom>
                           Finalize your template
                        </Typography>
                        <Grid container spacing={2}>
                           {targetTemplate.fields.map((field) => {
                              if (
                                 field.type === "string" ||
                                 field.type === "image"
                              ) {
                                 return (
                                    <Grid
                                       key={field.name}
                                       item
                                       xs={12}
                                       md={field.small && 6}
                                    >
                                       <TextField
                                          fullWidth
                                          variant="outlined"
                                          id={field.name}
                                          name={field.name}
                                          disabled={
                                             formik.isSubmitting ||
                                             sendingEmails
                                          }
                                          multiline={field.multiLine}
                                          minRows={field.multiLine && 3}
                                          maxRows={field.multiLine && 12}
                                          inputProps={{
                                             maxLength: field.maxLength,
                                          }}
                                          placeholder={field.placeHolder}
                                          label={field.label}
                                          onBlur={formik.handleBlur}
                                          value={formik.values[field.name]}
                                          onChange={formik.handleChange}
                                          error={
                                             formik.touched[field.name] &&
                                             Boolean(formik.errors[field.name])
                                          }
                                          helperText={
                                             formik.touched[field.name] &&
                                             formik.errors[field.name]
                                          }
                                       />
                                    </Grid>
                                 );
                              }
                              if (field.type === "date") {
                                 return (
                                    <Grid
                                       key={field.name}
                                       item
                                       xs={12}
                                       md={field.small && 6}
                                    >
                                       <DateTimePicker
                                          id={field.name}
                                          clearable
                                          disablePast
                                          label={field.label}
                                          labelFunc={(date) =>
                                             DateUtil.getRelativeDate(date)
                                          }
                                          value={formik.values[field.name]}
                                          name={field.name}
                                          onChange={(value) => {
                                             const newValue = value
                                                ? new Date(value)
                                                : null;
                                             formik.setFieldValue(
                                                field.name,
                                                newValue,
                                                true
                                             );
                                          }}
                                          disabled={
                                             formik.isSubmitting ||
                                             sendingEmails
                                          }
                                          minDate={now}
                                          inputVariant="outlined"
                                          fullWidth
                                          error={
                                             formik.touched[field.name] &&
                                             Boolean(formik.errors[field.name])
                                          }
                                          helperText={
                                             formik.touched[field.name] &&
                                             formik.errors[field.name]
                                          }
                                       />
                                    </Grid>
                                 );
                              }
                              return null;
                           })}
                        </Grid>
                        <DialogActions className={classes.actions}>
                           <Box marginRight="auto">
                              <Button
                                 onClick={handleClose}
                                 children={"Close"}
                                 disabled={sendingEmails}
                              />
                           </Box>
                           <Button onClick={handleBack}>Back</Button>
                           <Button
                              color={"secondary"}
                              variant="outlined"
                              disabled={
                                 formik.isSubmitting ||
                                 !formik.isValid ||
                                 sendingEmails
                              }
                              onClick={(e) => {
                                 formik.setFieldValue("isTestEmail", true);
                                 formik.handleSubmit(e);
                              }}
                           >
                              Send a test email
                           </Button>
                           <Button
                              color={"primary"}
                              variant="contained"
                              disabled={
                                 formik.isSubmitting ||
                                 !formik.isValid ||
                                 sendingEmails
                              }
                              onClick={(e) => {
                                 formik.setFieldValue("isTestEmail", false);
                                 formik.handleSubmit(e);
                              }}
                           >
                              Finalize and Send Emails
                           </Button>
                        </DialogActions>
                     </Box>
                  </Box>
                  <AreYouSureModal
                     handleClose={handleCloseSendConfirmEmailModal}
                     open={Boolean(confirmSendEmailModalData)}
                     title={"Just to be sure"}
                     loading={sendingEmails}
                     message={
                        <>
                           You confirm that you are sending this email to{" "}
                           <b>{emails.length}</b> users, this action cannot be
                           undone.
                        </>
                     }
                     confirmSecurityText={`Yes, I would like to send this email to ${emails.length} users`}
                     confirmButtonText={`Yes, I wish to send this email to ${emails.length} users`}
                     handleConfirm={() =>
                        handleConfirmSendEmail(confirmSendEmailModalData)
                     }
                  />
                  <SendTestEmailDialog
                     open={Boolean(confirmSendTestEmailModalData)}
                     testEmails={testEmails}
                     setTestEmails={setTestEmails}
                     handleConfirmSendTestEmail={() =>
                        handleConfirmSendTestEmail(
                           confirmSendTestEmailModalData
                        )
                     }
                     onClose={handleCloseSendTestEmailModalData}
                  />
               </>
            );
         }}
      </Formik>
   );
};

export default EmailTemplateForm;
