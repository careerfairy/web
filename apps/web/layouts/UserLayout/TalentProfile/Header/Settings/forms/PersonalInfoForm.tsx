import { UserData } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import {
   PersonalInfoSchema,
   PersonalInfoSchemaType,
   getInitialPersonalInfoValues,
} from "layouts/UserLayout/TalentProfile/Details/Profile/forms/schemas"
import { ReactNode, useEffect } from "react"
import { FormProvider, UseFormReturn, useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   formRoot: {
      //   minWidth: {
      //      xs: "313px",
      //      sm: "343px",
      //      md: "500px",
      //   },
      // width: "100%",
   },
})

type PersonalInfoFormProviderProps = {
   userData?: UserData
   children:
      | ((methods: UseFormReturn<PersonalInfoSchemaType>) => ReactNode)
      | ReactNode
}

export const PersonalInfoFormProvider = ({
   children,
   userData,
}: PersonalInfoFormProviderProps) => {
   const defaultValues = getInitialPersonalInfoValues(userData)

   const methods = useYupForm({
      schema: PersonalInfoSchema,
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

export const PersonalInfoFormFields = () => {
   const {
      formState: { isSubmitting },
   } = useFormContext()

   return (
      <Stack spacing={2} sx={styles.formRoot}>
         <ControlledBrandedTextField
            id="firstName"
            name="firstName"
            label="First name (required)"
            placeholder="E.g., John"
            disabled={isSubmitting}
            fullWidth
         />
         <ControlledBrandedTextField
            id="lastName"
            name="lastName"
            label="Last name (required)"
            placeholder="E.g., Doe"
            disabled={isSubmitting}
            fullWidth
         />
      </Stack>
   )
}
