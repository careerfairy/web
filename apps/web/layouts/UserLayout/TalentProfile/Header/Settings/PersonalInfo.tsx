import { Button, Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import {
   PersonalInfoFormFields,
   PersonalInfoFormProvider,
} from "./forms/PersonalInfoForm"

export const PersonalInfo = () => {
   const { userData } = useAuth()

   return (
      <PersonalInfoFormProvider userData={userData}>
         <Stack spacing={1.5}>
            <SuspenseWithBoundary>
               <PersonalInfoFormFields />
            </SuspenseWithBoundary>
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
