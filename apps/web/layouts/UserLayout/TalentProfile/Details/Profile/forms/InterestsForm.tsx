import { ProfileInterest } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { ReactNode } from "react"
import { FormProvider, UseFormReturn, useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import {
   CreateInterestSchema,
   CreateInterestSchemaType,
   getInitialInterestValues,
} from "./schemas"

const styles = sxStyles({
   formRoot: {
      minWidth: {
         xs: "313px",
         sm: "343px",
         md: "500px",
      },
   },
})

type InterestFormProviderProps = {
   interest?: ProfileInterest
   children:
      | ((methods: UseFormReturn<CreateInterestSchemaType>) => ReactNode)
      | ReactNode
}

export const InterestFormProvider = ({
   children,
   interest,
}: InterestFormProviderProps) => {
   const defaultValues = getInitialInterestValues(interest)

   const methods = useYupForm({
      schema: CreateInterestSchema,
      defaultValues: defaultValues,
      mode: "onChange",
      reValidateMode: "onChange",
   })

   return (
      <FormProvider {...methods}>
         {typeof children === "function" ? children(methods) : children}
      </FormProvider>
   )
}

export const InterestFormFields = () => {
   const {
      formState: { isSubmitting },
   } = useFormContext()
   console.log("🚀 ~ InterestFormFields ~ isSubmitting:", isSubmitting)
   return <Stack spacing={2} sx={styles.formRoot}></Stack>
}
