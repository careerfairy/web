import { GROUP_CONSTANTS } from "@careerfairy/shared-lib/groups/constants"
import { UniversityOption } from "@careerfairy/shared-lib/offline-events/offline-events"
import {
   UniversityCountry,
   universityCountryMap,
} from "@careerfairy/shared-lib/universities"
import { Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import {
   useFieldsOfStudy,
   useLevelsOfStudy,
} from "components/custom-hook/useCollection"
import { useUniversitiesByCountry } from "components/custom-hook/useUniversitiesByCountry"
import LazyMultiChipSelect from "components/views/common/inputs/LazyMultiChipSelect"
import { useCallback, useMemo } from "react"
import FormSectionHeader from "../../../../../../events/detail/form/FormSectionHeader"
import { getFieldsOfStudyWithoutOtherOption } from "../../../../../../events/detail/form/commons"
import MultiChipSelect from "../../../../../../events/detail/form/views/general/components/MultiChipSelect"
import InputSkeleton from "../../../../../../events/detail/form/views/questions/InputSkeleton"
import { useOfflineEventFormValues } from "../../../useOfflineEventFormValues"

const groupByUniversities = (uni: UniversityOption) =>
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

type Props = {
   countryCode: string
}

const AudienceTargetingContent = ({ countryCode }: Props) => {
   const {
      values: { general },
   } = useOfflineEventFormValues()

   const {
      data: universitiesByCountry,
      isLoading: universitiesByCountryLoading,
      error: universitiesByCountryError,
   } = useUniversitiesByCountry(countryCode)

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

   const filterUniversitiesBySelectedCountries = useCallback(
      (selectedCountries: string[]) => {
         return getUniversityOptions(universitiesByCountry, selectedCountries)
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
      return null
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
         </Stack>
      )
   }

   return (
      <>
         <LazyMultiChipSelect
            id="general.targetAudience.universities"
            options={filterUniversitiesBySelectedCountries([])}
            value={general.targetAudience?.universities || []}
            groupBy={groupByUniversities}
            limit={GROUP_CONSTANTS.MAX_TARGET_UNIVERSITY_COUNT}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "By university",
               placeholder: "Select university",
            }}
         />
         <MultiChipSelect
            id="general.targetAudience.fieldOfStudies"
            options={allFieldsOfStudyWithoutOther}
            value={general.targetAudience?.fieldOfStudies || []}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "By field of study",
               placeholder: "Select fields of study",
            }}
         />
         <MultiChipSelect
            id="general.targetAudience.levelOfStudies"
            options={allLevelsOfStudy}
            value={general.targetAudience?.levelOfStudies || []}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "By level of study",
               placeholder: "Select levels of study",
            }}
         />
      </>
   )
}

const AudienceTargeting = ({ countryCode }: Props) => {
   return (
      <SuspenseWithBoundary>
         <FormSectionHeader
            title="Target Students"
            subtitle="Select the target audience for this event"
            divider
         />
         <AudienceTargetingContent countryCode={countryCode} />
      </SuspenseWithBoundary>
   )
}

export default AudienceTargeting
