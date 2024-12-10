import {
   LanguageProficiencyLabels,
   LanguageProficiencyValues,
   languageOptionCodes,
} from "@careerfairy/shared-lib/constants/forms"
import { ProfileLanguage } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { languageCodesDict } from "components/helperFunctions/streamFormFunctions"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { mapOptions } from "components/views/signup/utils"
import { ReactNode, useEffect } from "react"
import { FormProvider, UseFormReturn, useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import {
   CreateLanguageSchema,
   CreateLanguageSchemaType,
   getInitialLanguageValues,
} from "./schemas"

const styles = sxStyles({
   formRoot: {
      maxWidth: "100%",
   },
})

type LanguageFormProviderProps = {
   language?: ProfileLanguage
   children:
      | ((methods: UseFormReturn<CreateLanguageSchemaType>) => ReactNode)
      | ReactNode
}

export const LanguageFormProvider = ({
   children,
   language,
}: LanguageFormProviderProps) => {
   const defaultValues = getInitialLanguageValues(language)

   const methods = useYupForm({
      schema: CreateLanguageSchema,
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
   }, [language])

   return (
      <FormProvider {...methods}>
         {typeof children === "function" ? children(methods) : children}
      </FormProvider>
   )
}

type LanguageFormFieldsProps = {
   filterLanguageIds?: string[]
}

export const LanguageFormFields = ({
   filterLanguageIds,
}: LanguageFormFieldsProps) => {
   const {
      formState: { isSubmitting },
   } = useFormContext()

   const options = mapOptions(languageOptionCodes).filter(
      (id) => !filterLanguageIds?.includes(id)
   )

   return (
      <Stack spacing={2} sx={styles.formRoot}>
         <ControlledBrandedAutoComplete
            label={"Language"}
            name={"languageId"}
            options={options}
            textFieldProps={{
               requiredText: "(required)",
               placeholder: "E.g., English",
               sx: {
                  maxWidth: "auto",
               },
            }}
            autocompleteProps={{
               id: "spokenLanguage",
               disabled: isSubmitting,
               disableClearable: false,
               autoHighlight: true,
               getOptionLabel: (option) => {
                  return (option && languageCodesDict[option]["name"]) || ""
               },
               isOptionEqualToValue: (option, value) => option === value,
            }}
         />

         <ControlledBrandedAutoComplete
            label={"Proficiency"}
            name={"proficiency"}
            options={LanguageProficiencyValues}
            textFieldProps={{
               requiredText: "(required)",
               placeholder: "E.g., Advanced",
            }}
            autocompleteProps={{
               id: "languageProficiency",
               disabled: isSubmitting,
               disableClearable: false,
               autoHighlight: true,
               getOptionLabel: (option) => {
                  return (option && LanguageProficiencyLabels[option]) || ""
               },
               isOptionEqualToValue: (option, value) => option === value,
            }}
         />
      </Stack>
   )
}
