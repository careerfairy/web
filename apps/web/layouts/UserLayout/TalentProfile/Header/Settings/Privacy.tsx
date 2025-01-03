import { Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { PrivacyFormFields, PrivacyFormProvider } from "./forms/PrivacyForm"

export const Privacy = () => {
   const { userData } = useAuth()
   return (
      <PrivacyFormProvider userData={userData}>
         <Stack>
            <PrivacyFormFields />
         </Stack>
      </PrivacyFormProvider>
   )
}
