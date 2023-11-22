import React, { useCallback, useState } from "react"
import { Formik } from "formik"
import {
   Box,
   Button,
   CircularProgress,
   DialogActions,
   Grid,
   Paper,
   TextField,
   Typography,
} from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"

import makeStyles from "@mui/styles/makeStyles"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import DateUtil from "../../../../../util/DateUtil"
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import SendTestEmailDialog from "./SendTestEmailDialog"
import ImageSelect from "../../../draftStreamForm/ImageSelect/ImageSelect"
import { getDownloadUrl } from "../../../../helperFunctions/streamFormFunctions"
import { TemplateDialogStepProps } from "./SendEmailTemplateDialog"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/dist/utils"

const now = new Date()

const useStyles = makeStyles((theme) => ({
   actions: {
      display: "flex",
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
   actionSectionButtons: {
      display: "flex",
      width: "100%",
      justifyContent: "space-between",
   },
}))
const EmailTemplateForm = ({
   handleClose,
   targetTemplate,
   targetStream,
   handleBack,
   totalUsers,
   queryOptions,
}: TemplateDialogStepProps) => {
   const { userData } = useAuth()
   const classes = useStyles()
   const dispatch = useDispatch()
   const [confirmSendEmailModalData, setConfirmSendEmailModalData] =
      useState(null)
   const [confirmSendTestEmailModalData, setConfirmSendTestEmailModalData] =
      useState(null)
   const [testEmails, setTestEmails] = useState([userData.userEmail])
   const [sendingEmails, setSendingEmails] = useState(false)

   const successSnackbar = useCallback(
      (numberOfEmails) =>
         dispatch(
            actions.enqueueSnackbar({
               message: `Emails have successfully been sent to ${numberOfEmails} user(s).`,
               options: {
                  variant: "success",
                  preventDuplicate: true,
               },
            })
         ),
      [dispatch]
   )

   const handleConfirmSendEmail = async (data) => {
      try {
         setSendingEmails(true)
         await targetTemplate.sendTemplate({
            ...data,
            senderEmail: userData.userEmail,
            isForRealEmails: true,
         })
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      setSendingEmails(false)
      handleCloseSendConfirmEmailModal()
      successSnackbar(totalUsers)
      handleClose()
   }

   const handleConfirmSendTestEmail = useCallback(
      async (data) => {
         let dataWithTestEmails = { ...data, senderEmail: userData.userEmail }
         // ensure that the emails
         dataWithTestEmails.testEmails = testEmails || []
         try {
            setSendingEmails(true)
            await targetTemplate.sendTemplate(dataWithTestEmails)
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
         setSendingEmails(false)
         handleCloseSendTestEmailModalData()
         successSnackbar(testEmails.length)
      },
      [
         dispatch,
         successSnackbar,
         targetTemplate,
         testEmails,
         userData.userEmail,
      ]
   )

   const handleCloseSendConfirmEmailModal = () =>
      setConfirmSendEmailModalData(null)
   const handleCloseSendTestEmailModalData = () =>
      setConfirmSendTestEmailModalData(null)

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
                  values: {
                     ...values,
                     eventUrl: addUtmTagsToLink({
                        link: values.eventUrl,
                        campaign: "events",
                        content: targetStream.company,
                     }),
                     start:
                        DateUtil.getRelativeDate(
                           values.eventStartDate
                        ).toString() + " CET",
                  },
                  templateId: targetTemplate.templateId,
                  queryOptions: queryOptions,
               }

               if (values.isTestEmail) {
                  // open test email modal
                  setConfirmSendTestEmailModalData(data)
               } else {
                  setConfirmSendEmailModalData(data)
               }
            } catch (e) {
               dispatch(actions.sendGeneralError(e))
            }
            setSubmitting(false)
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
                              if (field.type === "image") {
                                 return (
                                    <Grid
                                       key={field.name}
                                       item
                                       xs={12}
                                       md={field.small && 6}
                                    >
                                       <ImageSelect
                                          error={
                                             formik.touched[field.name] &&
                                             formik.errors[field.name]
                                          }
                                          value={formik.values[field.name]}
                                          // @ts-ignore
                                          handleBlur={formik.handleBlur}
                                          formName={field.name}
                                          setFieldValue={formik.setFieldValue}
                                          path={field.path}
                                          getDownloadUrl={getDownloadUrl}
                                          label={field.label}
                                          isSubmitting={
                                             formik.isSubmitting ||
                                             sendingEmails
                                          }
                                       />
                                    </Grid>
                                 )
                              }
                              if (field.type === "string") {
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
                                          maxRows={field.multiLine && 20}
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
                                          // @ts-ignore
                                          helperText={
                                             formik.touched[field.name] &&
                                             formik.errors[field.name]
                                          }
                                       />
                                    </Grid>
                                 )
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
                                          // @ts-ignore
                                          id={field.name}
                                          clearable
                                          disablePast
                                          renderInput={(params) => (
                                             <TextField fullWidth {...params} />
                                          )}
                                          label={field.label}
                                          // @ts-ignore
                                          labelFunc={(date) =>
                                             DateUtil.getRelativeDate(date) +
                                             " CET"
                                          }
                                          value={formik.values[field.name]}
                                          name={field.name}
                                          onChange={(value) => {
                                             const newValue = value
                                                ? new Date(value)
                                                : null
                                             formik.setFieldValue(
                                                field.name,
                                                newValue,
                                                true
                                             )
                                          }}
                                          disabled={
                                             formik.isSubmitting ||
                                             sendingEmails
                                          }
                                          minDate={now}
                                          inputVariant="outlined"
                                          error={
                                             formik.touched[field.name] &&
                                             Boolean(formik.errors[field.name])
                                          }
                                          helperText={
                                             formik.touched[field.name] &&
                                             formik.errors[field.name]
                                          }
                                          date={formik.values[field.name]}
                                          openPicker={true}
                                       />
                                    </Grid>
                                 )
                              }
                              return null
                           })}
                        </Grid>
                        <DialogActions
                           className={classes.actions}
                           sx={{
                              flexDirection: {
                                 xs: "column-reverse",
                                 md: "row",
                              },
                           }}
                        >
                           <Box className={classes.actionSectionButtons}>
                              <Box marginRight="auto">
                                 <Button
                                    onClick={handleClose}
                                    disabled={sendingEmails}
                                 >
                                    Close
                                 </Button>
                              </Box>
                              <Button onClick={handleBack}>Back</Button>
                           </Box>

                           <Box
                              className={classes.actionSectionButtons}
                              sx={{ marginY: { xs: 1, sm: 0 } }}
                           >
                              <Button
                                 color={"secondary"}
                                 variant="outlined"
                                 disabled={
                                    formik.isSubmitting ||
                                    !formik.isValid ||
                                    sendingEmails
                                 }
                                 sx={{
                                    width: { xs: "49%", sm: "unset" },
                                    height: { xs: "70px", sm: "unset" },
                                 }}
                                 onClick={(e) => {
                                    formik.setFieldValue("isTestEmail", true)
                                    // @ts-ignore
                                    formik.handleSubmit(e)
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
                                 sx={{
                                    width: { xs: "49%", sm: "unset" },
                                    height: { xs: "70px", sm: "unset" },
                                 }}
                                 onClick={(e) => {
                                    formik.setFieldValue("isTestEmail", false)
                                    // @ts-ignore
                                    formik.handleSubmit(e)
                                 }}
                              >
                                 Finalize and Send Emails
                              </Button>
                           </Box>
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
                           <b>{totalUsers}</b> users, this action cannot be
                           undone.
                        </>
                     }
                     confirmSecurityText={`I wish to send this email to ${totalUsers} users`}
                     confirmButtonText={`Send this email to ${totalUsers} users`}
                     handleConfirm={() =>
                        handleConfirmSendEmail(confirmSendEmailModalData)
                     }
                  />
                  <SendTestEmailDialog
                     open={Boolean(confirmSendTestEmailModalData)}
                     testEmails={testEmails}
                     setTestEmails={setTestEmails}
                     loading={sendingEmails}
                     handleConfirmSendTestEmail={() =>
                        handleConfirmSendTestEmail(
                           confirmSendTestEmailModalData
                        )
                     }
                     onClose={handleCloseSendTestEmailModalData}
                  />
               </>
            )
         }}
      </Formik>
   )
}

export default EmailTemplateForm
