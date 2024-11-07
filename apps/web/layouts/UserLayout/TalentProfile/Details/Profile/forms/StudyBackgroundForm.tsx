import { StudyBackground } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { UniversityCountrySelector } from "components/views/profile/userData/personal-info/UniversityCountrySelector"
import SelectUniversitiesDropDown from "components/views/universitySelect/SelectUniversitiesDropDown"
import { ReactNode } from "react"
import { FormProvider, UseFormReturn, useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import {
   CreateStudyBackgroundSchema,
   CreateStudyBackgroundSchemaType,
   getInitialStudyBackgroundValues,
} from "./schemas"

const styles = sxStyles({
   formRoot: {
      p: 1,
      minWidth: "500px",
   },
})

type StudyBackgroundFormProviderProps = {
   studyBackground?: StudyBackground
   children:
      | ((methods: UseFormReturn<CreateStudyBackgroundSchemaType>) => ReactNode)
      | ReactNode
}

export const StudyBackgroundFormProvider = ({
   children,
   studyBackground,
}: StudyBackgroundFormProviderProps) => {
   const methods = useYupForm({
      schema: CreateStudyBackgroundSchema,
      defaultValues: getInitialStudyBackgroundValues(studyBackground),
      mode: "onChange",
      reValidateMode: "onChange",
   })

   return (
      <FormProvider {...methods}>
         {typeof children === "function" ? children(methods) : children}
      </FormProvider>
   )
}

export const StudyBackgroundFormFields = () => {
   const {
      formState: { defaultValues, isSubmitting },
   } = useFormContext<CreateStudyBackgroundSchemaType>()

   console.log("🚀 ~ StudyBackgroundFormFields ~ isSubmitting:", isSubmitting)
   const isEditing = Boolean(defaultValues.id)
   console.log("🚀 ~ StudyBackgroundFormFields ~ isEditing:", isEditing)

   return (
      <Stack sx={styles.formRoot} spacing={2}>
         <UniversityCountrySelector
            name="universityCountryCode"
            universityFieldName="universityId"
         />
         <SelectUniversitiesDropDown
            label="School"
            placeholder="E.g., ETH Zurich"
            countryCodeFieldName="universityCountryCode"
            name="universityId"
         />
      </Stack>
   )
}
