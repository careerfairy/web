import { Button, Stack } from "@mui/material"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { auth } from "data/firebase/FirebaseInstance"
import {
   EmailAuthProvider,
   reauthenticateWithCredential,
   updatePassword,
} from "firebase/auth"
import { useFormContext } from "react-hook-form"
import { PasswordFormFields, PasswordFormProvider } from "./forms/PasswordForm"
import { PasswordFormValues, PasswordSchemaType } from "./forms/schemas"

export const Password = () => {
   return (
      <PasswordFormProvider>
         <PasswordForm />
      </PasswordFormProvider>
   )
}

const PasswordForm = () => {
   const { errorNotification, successNotification } = useSnackbarNotifications()
   const {
      formState: { isDirty, isValid },
      reset,
      handleSubmit,
   } = useFormContext<PasswordSchemaType>()

   const onSubmit = async (data: PasswordFormValues) => {
      try {
         const user = auth.currentUser

         if (!user) {
            throw new Error("User is not authenticated.")
         }

         // Create credentials using the current password
         const credential = EmailAuthProvider.credential(
            user.email,
            data.currentPassword
         )

         try {
            // Reauthenticate the user
            await reauthenticateWithCredential(user, credential)
         } catch (error) {
            errorNotification("Authentication failed. Please try again.")
            return
         }

         // Now you can proceed with password update
         await updatePassword(user, data.newPassword)

         reset()
         successNotification("Password updated successfully")
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while updating your password. Rest assured, we're on it!"
         )
      }
   }

   const handleSave = async () => handleSubmit(onSubmit)()

   return (
      <Stack spacing={1.5}>
         <PasswordFormFields />
         <Button
            onClick={handleSave}
            disabled={!isDirty || !isValid}
            variant="contained"
            color="primary"
         >
            Update password
         </Button>
      </Stack>
   )
}
