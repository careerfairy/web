import { UserData } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { ReactNode, useEffect } from "react"
import { FormProvider, UseFormReturn, useFormContext } from "react-hook-form"
import {
   PasswordSchema,
   PasswordSchemaType,
   getInitialPasswordValues,
} from "./schemas"

type PasswordFormProviderProps = {
   userData?: UserData
   children:
      | ((methods: UseFormReturn<PasswordSchemaType>) => ReactNode)
      | ReactNode
}

export const PasswordFormProvider = ({
   children,
   userData,
}: PasswordFormProviderProps) => {
   const defaultValues = getInitialPasswordValues()

   const methods = useYupForm({
      schema: PasswordSchema,
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

export const PasswordFormFields = () => {
   const { watch, trigger } = useFormContext<PasswordSchemaType>()

   const currentPassword = watch("currentPassword")
   const newPassword = watch("newPassword")
   const confirmPassword = watch("confirmPassword")

   useEffect(() => {
      if (currentPassword) trigger("currentPassword")
      if (newPassword) trigger("newPassword")
      if (confirmPassword) trigger("confirmPassword")
   }, [currentPassword, newPassword, confirmPassword, trigger])

   return (
      <Stack spacing={2}>
         <ControlledBrandedTextField
            name="currentPassword"
            label="Current password"
            type="password"
         />
         <ControlledBrandedTextField
            name="newPassword"
            label="New password"
            type="password"
         />
         <ControlledBrandedTextField
            name="confirmPassword"
            label="Confirm new password"
            type="password"
         />
      </Stack>
   )
}
