import { StudyBackground } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { universityCountriesMap } from "components/util/constants/universityCountries"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { ReactNode } from "react"
import { FormProvider, UseFormReturn, useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { getInitialValues } from "./CreateOrEditStudyBackgroundForm"
import {
   CreateStudyBackgroundSchema,
   CreateStudyBackgroundSchemaType,
} from "./schemas"

const countryKeys = Object.keys(universityCountriesMap)

const styles = sxStyles({
   formRoot: {
      p: 1,
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
      defaultValues: getInitialValues(studyBackground),
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

   const isEditing = Boolean(defaultValues.id)
   console.log("🚀 ~ StudyBackgroundFormFields ~ isEditing:", isEditing)

   return (
      <Stack sx={styles.formRoot}>
         <ControlledBrandedAutoComplete
            label="School"
            name="universityId"
            options={countryKeys}
            autocompleteProps={{
               id: "universityId",
               disabled: isSubmitting,
               autoHighlight: true,
               disableClearable: true,
            }}
         />
      </Stack>
   )
}
