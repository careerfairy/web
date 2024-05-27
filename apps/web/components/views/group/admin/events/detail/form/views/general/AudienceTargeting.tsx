import { CompanyCountryValues } from "@careerfairy/shared-lib/constants/forms"
import {
   GroupOption,
   GroupTargetUniversity,
} from "@careerfairy/shared-lib/groups"
import { GROUP_CONSTANTS } from "@careerfairy/shared-lib/groups/constants"
import {
   University,
   UniversityCountry,
   universityCountryMap,
} from "@careerfairy/shared-lib/universities"
import { Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import {
   useFieldsOfStudy,
   useLevelsOfStudy,
   useUniversityCountries,
} from "components/custom-hook/useCollection"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useCallback, useMemo } from "react"
import FormSectionHeader from "../../FormSectionHeader"
import { getFieldsOfStudyWithoutOtherOption } from "../../commons"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import InputSkeleton from "../questions/InputSkeleton"
import MultiChipSelect from "./components/MultiChipSelect"

type UniversityOption = University & {
   country: string
}

const groupByUniversities = (uni: GroupTargetUniversity) =>
   universityCountryMap?.[uni.country] || uni.country

const getUniversityOptions = (
   universityCountries: UniversityCountry[],
   universityCountryCodes: string[]
): UniversityOption[] => {
   let universityCountriesArray = [...universityCountries] // if no countries are selected, show all universities
   if (universityCountryCodes.length > 0) {
      // if countries are selected, filter universities by country
      universityCountriesArray = universityCountries.filter(
         (universityCountry) =>
            universityCountryCodes.includes(universityCountry.id)
      )
   }
   const universityOptions = universityCountriesArray.reduce<
      UniversityOption[]
   >(
      (acc, universityCountry) =>
         acc.concat(
            universityCountry.universities.map((uni) => {
               return {
                  ...uni,
                  country: universityCountry.countryId,
               }
            })
         ),
      []
   )

   return universityOptions
}

const AudienceTargetingContent = () => {
   const {
      values: { general },
   } = useLivestreamFormValues()
   const {
      data: universitiesByCountry,
      isLoading: universitiesByCountryLoading,
      error: universitiesByCountryError,
   } = useUniversityCountries()
   const {
      data: allFieldsOfStudy,
      isLoading: allFieldsOfStudyLoading,
      error: allFieldsOfStudyError,
   } = useFieldsOfStudy()
   const {
      data: allLevelsOfStudy,
      isLoading: allLevelsOfStudyLoading,
      error: allLevelsOfStudyError,
   } = useLevelsOfStudy()

   const filterUniversitiesBySelectedContries = useCallback(
      (selectedCountries: GroupOption[]) => {
         const selectedCountriesIds =
            selectedCountries?.map((country) => country.id) || []
         return getUniversityOptions(
            universitiesByCountry,
            selectedCountriesIds
         )
      },
      [universitiesByCountry]
   )

   // We are excluding the "Other" option only in B2B because we have the "Any field of study" option
   const allFieldsOfStudyWithoutOther = useMemo(() => {
      return getFieldsOfStudyWithoutOtherOption(allFieldsOfStudy)
   }, [allFieldsOfStudy])

   if (
      universitiesByCountryError ||
      allFieldsOfStudyError ||
      allLevelsOfStudyError
   ) {
      return <div>Error</div>
   }

   if (
      universitiesByCountryLoading ||
      allFieldsOfStudyLoading ||
      allLevelsOfStudyLoading
   ) {
      return (
         <Stack spacing={2}>
            <InputSkeleton />
            <InputSkeleton />
            <InputSkeleton />
            <InputSkeleton />
         </Stack>
      )
   }

   return (
      <>
         <MultiChipSelect
            id="general.targetCountries"
            options={CompanyCountryValues}
            value={general.targetCountries}
            limit={GROUP_CONSTANTS.MAX_TARGET_COUNTRY_COUNT}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "By country",
               placeholder: "Select country",
            }}
         />
         {general.targetCountries?.length === 0 ? (
            <BrandedTextField
               disabled
               label="By university"
               value="Please first select your target countries"
            />
         ) : (
            <MultiChipSelect
               id="general.targetUniversities"
               options={filterUniversitiesBySelectedContries(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  general.targetCountries as any
               )}
               value={general.targetUniversities}
               groupBy={groupByUniversities}
               limit={GROUP_CONSTANTS.MAX_TARGET_UNIVERSITY_COUNT}
               multiple
               disableCloseOnSelect
               textFieldProps={{
                  label: "By university",
                  placeholder: "Select university",
               }}
            />
         )}
         <MultiChipSelect
            id="general.targetFieldsOfStudy"
            options={allFieldsOfStudyWithoutOther}
            value={general.targetFieldsOfStudy}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "By field of study",
               placeholder: "Select fields of study",
               required: true,
            }}
            selectAllFieldLabel="Any field of study"
         />
         <MultiChipSelect
            id="general.targetLevelsOfStudy"
            options={allLevelsOfStudy}
            value={general.targetLevelsOfStudy}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "By level of study",
               placeholder: "Select levels of study",
               required: true,
            }}
         />
      </>
   )
}

const AudienceTargeting = () => {
   return (
      <SuspenseWithBoundary>
         <FormSectionHeader
            title="Target Students"
            subtitle="Select the target audience for this live stream"
            divider
         />
         <AudienceTargetingContent />
      </SuspenseWithBoundary>
   )
}

export default AudienceTargeting
