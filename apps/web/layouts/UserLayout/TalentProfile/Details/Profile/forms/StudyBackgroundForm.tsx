import { StudyBackground } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import useIsMobile from "components/custom-hook/useIsMobile"
import { UniversityCountrySelector } from "components/views/profile/userData/personal-info/UniversityCountrySelector"
import SelectUniversitiesDropDown from "components/views/universitySelect/SelectUniversitiesDropDown"
import { DateTime } from "luxon"
import { ReactNode, useEffect } from "react"
import { FormProvider, UseFormReturn, useWatch } from "react-hook-form"
import {
   CreateStudyBackgroundSchema,
   CreateStudyBackgroundSchemaType,
   getInitialStudyBackgroundValues,
} from "./schemas"
import { AcademicDatePicker } from "./selectors/AcademicDatePicker"
import {
   FieldsOfStudySelector,
   LevelsOfStudySelector,
} from "./selectors/StudyDomainSelector"

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
   const defaultValues = getInitialStudyBackgroundValues(studyBackground)

   const methods = useYupForm({
      schema: CreateStudyBackgroundSchema,
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
   }, [studyBackground])

   return (
      <FormProvider {...methods}>
         {typeof children === "function" ? children(methods) : children}
      </FormProvider>
   )
}

export const StudyBackgroundFormFields = () => {
   const isMobile = useIsMobile()

   const startedAtDateValue: Date = useWatch({
      name: "startedAt",
   })

   const minEndedAtDate = startedAtDateValue
      ? DateTime.fromJSDate(startedAtDateValue).plus({ month: 1 }).toJSDate()
      : null

   return (
      <Stack spacing={2}>
         <UniversityCountrySelector
            name="universityCountryCode"
            universityFieldName="universityId"
            placeholder="E.g., Switzerland"
            label="Country"
            requiredText="(required)"
         />
         <SelectUniversitiesDropDown
            label="School"
            placeholder="E.g., ETH Zurich"
            countryCodeFieldName="universityCountryCode"
            name="universityId"
         />
         <FieldsOfStudySelector fieldName="fieldOfStudy" />
         <LevelsOfStudySelector fieldName="levelOfStudy" />
         <Stack
            direction={isMobile ? "column" : "row"}
            width={"100%"}
            spacing={2}
            justifyContent={"space-between"}
         >
            <AcademicDatePicker fieldName="startedAt" label="Start Date" />
            <AcademicDatePicker
               fieldName="endedAt"
               label="End Date (or expected)"
               minDate={minEndedAtDate}
               disabled={!startedAtDateValue}
            />
         </Stack>
      </Stack>
   )
}
