import { UserDataPersonalInfo } from "@careerfairy/shared-lib/users"
import { Button, Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { userRepo } from "data/RepositoryInstances"
import { useFormContext } from "react-hook-form"
import {
   PersonalInfoFormFields,
   PersonalInfoFormProvider,
} from "./forms/PersonalInfoForm"
import { PersonalInfoFormValues, PersonalInfoSchemaType } from "./forms/schemas"

export const PersonalInfo = () => {
   const { userData } = useAuth()

   return (
      <PersonalInfoFormProvider userData={userData}>
         <PersonalInfoView />
      </PersonalInfoFormProvider>
   )
}

const PersonalInfoView = () => {
   const { userData } = useAuth()
   const {
      formState: { isValid, isDirty },
      handleSubmit,
   } = useFormContext<PersonalInfoSchemaType>()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const onSubmit = async (data: PersonalInfoFormValues) => {
      try {
         const profileInfo: UserDataPersonalInfo = {
            ...data,
         }

         await userRepo.updatePersonalInfo(userData.id, profileInfo)

         successNotification(`Profile updated 🎓`)
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while updating your profile. Rest assured, we're on it!"
         )
      }
   }

   const handleSave = async () => handleSubmit(onSubmit)()

   return (
      <Stack spacing={1.5}>
         <SuspenseWithBoundary>
            <PersonalInfoFormFields />
         </SuspenseWithBoundary>
         <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!isValid || !isDirty}
         >
            Save changes
         </Button>
      </Stack>
   )
}
