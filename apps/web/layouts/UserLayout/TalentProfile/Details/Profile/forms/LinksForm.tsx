import { ProfileLink } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { ReactNode, useEffect } from "react"
import { FormProvider, UseFormReturn, useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import {
   CreateLinkSchema,
   CreateLinkSchemaType,
   getInitialLinkValues,
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

type LinkFormProviderProps = {
   link?: ProfileLink
   children:
      | ((methods: UseFormReturn<CreateLinkSchemaType>) => ReactNode)
      | ReactNode
}

export const LinkFormProvider = ({ children, link }: LinkFormProviderProps) => {
   const defaultValues = getInitialLinkValues(link)

   const methods = useYupForm({
      schema: CreateLinkSchema,
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
   }, [link])

   return (
      <FormProvider {...methods}>
         {typeof children === "function" ? children(methods) : children}
      </FormProvider>
   )
}

export const LinkFormFields = () => {
   const {
      formState: { isSubmitting },
   } = useFormContext()
   return (
      <Stack spacing={2} sx={styles.formRoot}>
         <ControlledBrandedTextField
            id="title"
            name="title"
            label="Link title (required)"
            placeholder="E.g., Portfolio"
            disabled={isSubmitting}
            fullWidth
         />
         <ControlledBrandedTextField
            id="url"
            name="url"
            label="URL (required)"
            placeholder="E.g., behance.net/user"
            disabled={isSubmitting}
            fullWidth
         />
      </Stack>
   )
}
