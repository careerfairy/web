import { Button, Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import {
   PersonalInfoFormFields,
   PersonalInfoFormProvider,
} from "./forms/PersonalInfoForm"

export const PersonalInfo = () => {
   const { userData } = useAuth()

   return (
      <PersonalInfoFormProvider userData={userData}>
         <Stack spacing={1.5}>
            <PersonalInfoFormFields />
            <Button
               variant="contained"
               color="primary"
               onClick={() => alert("Save to be done")}
            >
               Save changes
            </Button>
         </Stack>
      </PersonalInfoFormProvider>
   )
}
