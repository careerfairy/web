import { UserData } from "@careerfairy/shared-lib/users"
import { Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import BrandedSwitch from "components/views/common/inputs/BrandedSwitch"
import { userRepo } from "data/RepositoryInstances"
import { ReactNode, useCallback, useEffect } from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import {
   PrivacySchema,
   PrivacySchemaType,
   getInitialPrivacyValues,
} from "./schemas"

const styles = sxStyles({
   formRoot: {
      mx: {
         md: 0,
         sm: 1,
         xs: 1,
      },
      mt: 2,
   },
   switch: {
      "& .MuiSwitch-switchBase": {
         "&.Mui-checked": {
            "& + .MuiSwitch-track": {
               backgroundColor: (theme) => theme.palette.primary.main,
            },
         },
      },
   },
})

type PrivacyFormProviderProps = {
   userData?: UserData
   children:
      | ((methods: UseFormReturn<PrivacySchemaType>) => ReactNode)
      | ReactNode
}

export const PrivacyFormProvider = ({
   children,
   userData,
}: PrivacyFormProviderProps) => {
   const defaultValues = getInitialPrivacyValues(userData)

   const methods = useYupForm({
      schema: PrivacySchema,
      defaultValues: defaultValues,
      mode: "onChange",
      reValidateMode: "onChange",
   })

   // Explicitly reset form values after initialization if they change
   useEffect(() => {
      methods.reset(defaultValues)
      return () => {
         methods.reset({})
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [userData])

   return (
      <FormProvider {...methods}>
         {typeof children === "function" ? children(methods) : children}
      </FormProvider>
   )
}

export const PrivacyFormFields = () => {
   const { userData } = useAuth()

   const handleToggleNewsletter = useCallback(async () => {
      await userRepo.updateUserData(userData.id, {
         unsubscribed: !userData.unsubscribed,
      })
   }, [userData])

   return (
      <Stack spacing={2} sx={styles.formRoot}>
         <Stack direction={"row"} alignItems={"center"} spacing={2.5}>
            <Stack spacing={"10px"}>
               <Typography
                  variant="brandedBody"
                  fontWeight={400}
                  color="neutral.800"
               >
                  Newsletter
               </Typography>
               <Typography variant="small" fontWeight={400} color="neutral.600">
                  I want to join 80´000+ students who receive personalised
                  invitations to career events and job openings
               </Typography>
            </Stack>
            <BrandedSwitch
               checked={userData?.unsubscribed}
               onChange={handleToggleNewsletter}
               sx={styles.switch}
            />
         </Stack>
      </Stack>
   )
}
