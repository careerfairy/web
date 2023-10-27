import React from "react"
import { GlassDialog } from "../../../../../materialUI/GlobalModals"
import {
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   MenuItem,
   Slide,
   TextField,
} from "@mui/material"
import { Formik, FormikHelpers } from "formik"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
} from "@careerfairy/shared-lib/dist/groups"

import * as yup from "yup"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import Grid from "@mui/material/Grid"

interface AddMemberModalProps {
   open: boolean
   onClose: () => void
   group: Group
}

const schema = yup.object().shape({
   email: yup.string().email().required("Required"),
   role: yup
      .mixed<GROUP_DASHBOARD_ROLE>()
      .oneOf(Object.values(GROUP_DASHBOARD_ROLE)),
})
const AddMemberModal = ({
   open = false,
   onClose,
   group,
}: AddMemberModalProps) => {
   const { successNotification } = useSnackbarNotifications()

   const { sendGroupAdminInviteEmail } = useFirebaseService()

   const { userData } = useAuth()

   const handleClose = (resetCallback) => {
      onClose()
      if (resetCallback) {
         resetCallback()
      }
   }

   const handleSubmit = async (
      values,
      { resetForm, setFieldError }: FormikHelpers<AddMemberModalProps>
   ) => {
      try {
         let successMessage = `An invitation email has been sent to ${values.email}`

         await sendGroupAdminInviteEmail({
            groupName: group.universityName,
            groupId: group.id || group.groupId,
            recipientEmail: values.email,
            senderFirstName: userData.firstName,
            role: values.role,
         })

         successNotification(successMessage)
         handleClose(resetForm)
      } catch (error) {
         setFieldError("email", error.message)
      }
   }

   return (
      <Formik
         initialValues={{ email: "", role: GROUP_DASHBOARD_ROLE.MEMBER }}
         validationSchema={schema}
         enableReinitialize
         onSubmit={handleSubmit}
      >
         {({
            values,
            errors,
            handleChange,
            handleSubmit,
            isSubmitting,
            resetForm,
            dirty,
            /* and other goodies */
         }) => (
            <GlassDialog
               TransitionComponent={Slide}
               onClose={() => handleClose(resetForm)}
               open={open}
            >
               <form onSubmit={handleSubmit}>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogContent>
                     <DialogContentText
                        sx={{
                           mb: 2,
                        }}
                     >
                        Please provide an email that you would like to invite
                     </DialogContentText>
                     <Grid container spacing={1}>
                        <Grid item xs={12} sm={8}>
                           <TextField
                              fullWidth
                              // @ts-ignore
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
                        </Grid>
                        <Grid item xs={12} sm={4}>
                           <TextField
                              id="role-select"
                              select
                              label="Choose a role"
                              value={values.role}
                              name="role"
                              onChange={handleChange}
                              helperText="Please select a role"
                           >
                              {Object.values(GROUP_DASHBOARD_ROLE).map(
                                 (role) => (
                                    <MenuItem key={role} value={role}>
                                       {role}
                                    </MenuItem>
                                 )
                              )}
                           </TextField>
                        </Grid>
                     </Grid>
                  </DialogContent>
                  <DialogActions>
                     <Button
                        color="grey"
                        onClick={() => handleClose(resetForm)}
                     >
                        Cancel
                     </Button>
                     <Button
                        variant="contained"
                        type="submit"
                        endIcon={
                           isSubmitting && (
                              <CircularProgress size={20} color="inherit" />
                           )
                        }
                        disabled={!dirty || isSubmitting}
                        color="primary"
                     >
                        {!isSubmitting && "Send Invite"}
                     </Button>
                  </DialogActions>
               </form>
            </GlassDialog>
         )}
      </Formik>
   )
}

export default AddMemberModal
