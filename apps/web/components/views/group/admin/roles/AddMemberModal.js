import PropTypes from "prop-types"
import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { GlassDialog } from "../../../../../materialUI/GlobalModals"
import {
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Slide,
   TextField,
} from "@mui/material"
import { Formik } from "formik"
import { EMAIL_REGEX, GENERAL_ERROR } from "../../../../util/constants"
import DataAccessUtil from "../../../../../util/DataAccessUtil"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { useSnackbar } from "notistack"
import { withFirebase } from "../../../../../context/firebase/FirebaseServiceContext"

const useStyles = makeStyles((theme) => ({}))

const AddMemberModal = ({ open = false, onClose, group, firebase }) => {
   const { enqueueSnackbar } = useSnackbar()
   const classes = useStyles()
   const { userData } = useAuth()
   const handleClose = (resetCallback) => {
      onClose()
      if (resetCallback) {
         resetCallback()
      }
   }

   const buildInviteLink = (notificationId) => {
      let baseUrl = "https://careerfairy.io"
      if (window?.location?.origin) {
         baseUrl = window.location.origin
      }
      return `${baseUrl}/group/${
         group.id || group.groupId
      }/admin?dashboardInviteId=${notificationId}`
      // return `${baseUrl}/group/${
      //    group.id || group.groupId
      // }/admin?dashboardInviteId=${notificationId}`
   }

   const handleSubmit = async (values, { resetForm }) => {
      try {
         const notificationType = "dashboardInvite"
         let successMessage = `An invitation email has been sent to ${values.email}`
         const notificationDetails = {
            type: notificationType,
            receiver: values.email,
            requester: group.id,
         }

         const invitationRef = await firebase.createNotification(
            notificationDetails,
            { force: true }
         )
         const notificationId = invitationRef.id
         const inviteLink = buildInviteLink(notificationId)
         await DataAccessUtil.sendDashboardInvite(
            values.email,
            userData,
            group,
            inviteLink
         )
         enqueueSnackbar(successMessage, {
            preventDuplicate: true,
            variant: "success",
         })
      } catch (error) {
         console.error("-> error", error)
         enqueueSnackbar(GENERAL_ERROR, {
            preventDuplicate: true,
            variant: "error",
         })
      }
      handleClose(resetForm)
   }

   return (
      <Formik
         autoComplete="off"
         initialValues={{ email: "" }}
         enableReinitialize
         validate={(values) => {
            let errors = {}
            if (!values.email) {
               errors.email = "Required"
            } else if (!EMAIL_REGEX.test(values.email)) {
               errors.email = "Please enter a valid email"
            }
            return errors
         }}
         onSubmit={handleSubmit}
      >
         {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            resetForm,
            dirty,
            setFieldValue,
            /* and other goodies */
         }) => (
            <GlassDialog
               TransitionComponent={Slide}
               onClose={() => handleClose(resetForm)}
               open={open}
            >
               <DialogTitle>Invite Member</DialogTitle>
               <DialogContent>
                  <DialogContentText>
                     Please provide an email that you would like to invite
                  </DialogContentText>
                  <TextField
                     fullWidth
                     helperText={errors.email}
                     label="Email"
                     autoFocus
                     autoComplete="email"
                     disabled={isSubmitting}
                     name="email"
                     onChange={handleChange}
                     required
                     error={Boolean(errors.email)}
                     value={values.email}
                  />
               </DialogContent>
               <DialogActions>
                  <Button color="grey" onClick={() => handleClose(resetForm)}>
                     Cancel
                  </Button>
                  <Button
                     variant="contained"
                     endIcon={
                        isSubmitting && (
                           <CircularProgress size={20} color="inherit" />
                        )
                     }
                     disabled={!dirty || isSubmitting}
                     onClick={handleSubmit}
                     color="primary"
                  >
                     {!isSubmitting && "Send Invite"}
                  </Button>
               </DialogActions>
            </GlassDialog>
         )}
      </Formik>
   )
}
AddMemberModal.propTypes = {
   firebase: PropTypes.object,
   group: PropTypes.object,
   onClose: PropTypes.func,
   open: PropTypes.bool,
}

AddMemberModal.defaultProps = {
   open: false,
}

export default withFirebase(AddMemberModal)
