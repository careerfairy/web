import {
   LanguageProficiencyLabels,
   LanguageProficiencyValues,
   languageOptionCodes,
} from "@careerfairy/shared-lib/constants/forms"
import { ProfileLanguage } from "@careerfairy/shared-lib/users"
import { MenuItem, Stack, Typography } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { languageCodesDict } from "components/helperFunctions/streamFormFunctions"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
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
   menuItem: {
      "&.Mui-selected": {
         backgroundColor: "info.light",
         "&:hover": {
            backgroundColor: "info.light",
         },
      },
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
      setValue,
      watch,
   } = useFormContext<CreateLanguageSchemaType>()

   const proficiency = watch("proficiency")
   const options = mapOptions(languageOptionCodes).filter(
      (id) => !filterLanguageIds?.includes(id)
   )

   return (
      <Stack spacing={2} sx={styles.formRoot}>
         <BrandedTextField
            select
            label={"Language"}
            name={"languageId"}
            SelectProps={{
               displayEmpty: true,
               MenuProps: {
                  sx: {
                     "& .MuiMenu-paper": {
                        boxShadow: "0px 7px 4px -9px rgba(0,0,0,0.8)",
                        filter: "none",
                        border: "0.5px solid #E0E0E0",
                        borderRadius: "4px",
                        transition: "none",
                     },
                  },
                  TransitionProps: {
                     enter: false,
                     exit: false,
                  },
                  transitionDuration: 0,
               },
               renderValue: (value: string) => {
                  return value ? (
                     languageCodesDict[value]["name"]
                  ) : (
                     <Typography color={"neutral.400"}>
                        E.g., English
                     </Typography>
                  )
               },
            }}
            disabled={isSubmitting}
            fullWidth
            value={watch("languageId")}
            requiredText="(required)"
         >
            {options.map((option) => (
               <MenuItem
                  key={option}
                  value={option}
                  onClick={() =>
                     setValue("languageId", option, { shouldValidate: true })
                  }
                  sx={styles.menuItem}
               >
                  {languageCodesDict[option]["name"]}
               </MenuItem>
            ))}
         </BrandedTextField>
         <BrandedTextField
            select
            label={"Proficiency"}
            name={"proficiency"}
            SelectProps={{
               displayEmpty: true,
               MenuProps: {
                  sx: {
                     "& .MuiMenu-paper": {
                        boxShadow: "0px 7px 4px -9px rgba(0,0,0,0.8)",
                        filter: "none",
                        border: "0.5px solid #E0E0E0",
                        borderRadius: "4px",
                        transition: "none",
                     },
                  },
                  TransitionProps: {
                     enter: false,
                     exit: false,
                  },
                  transitionDuration: 0,
               },
               renderValue: (value: string) => {
                  return value ? (
                     LanguageProficiencyLabels[value]
                  ) : (
                     <Typography color={"neutral.400"}>
                        E.g., Advanced
                     </Typography>
                  )
               },
            }}
            disabled={isSubmitting}
            fullWidth
            value={proficiency}
            requiredText="(required)"
         >
            {LanguageProficiencyValues.map((value) => (
               <MenuItem
                  key={value}
                  value={value}
                  onClick={() =>
                     setValue("proficiency", value, { shouldValidate: true })
                  }
                  sx={styles.menuItem}
               >
                  {LanguageProficiencyLabels[value]}
               </MenuItem>
            ))}
         </BrandedTextField>
      </Stack>
   )
}
