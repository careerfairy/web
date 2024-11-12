import { ProfileLink } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ReactNode, useEffect } from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"
import {
   CreateLinkSchema,
   CreateLinkSchemaType,
   getInitialLinkValues,
} from "./schemas"

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
   const isMobile = useIsMobile()
   console.log("🚀 ~ LinkFormFields ~ isMobile:", isMobile)

   return <Stack spacing={2}></Stack>
}
