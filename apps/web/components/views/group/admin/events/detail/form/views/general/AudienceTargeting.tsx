import { useCallback } from "react"
import {
   useUniversityCountries,
   useFieldsOfStudy,
   useLevelsOfStudy,
} from "components/custom-hook/useCollection"
import { CompanyCountryValues } from "constants/forms"
import FormSectionHeader from "../../FormSectionHeader"
import MultiChipSelect from "./components/MultiChipSelect"
import { GROUP_CONSTANTS } from "@careerfairy/shared-lib/groups/constants"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import {
   GroupOption,
   GroupTargetUniversity,
} from "@careerfairy/shared-lib/groups"
import {
   University,
   UniversityCountry,
   universityCountryMap,
} from "@careerfairy/shared-lib/universities"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"

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

const AudienceTargeting = () => {
   const {
      values: { general },
   } = useLivestreamFormValues()
   const { data: universitiesByCountry } = useUniversityCountries()
   const { data: allFieldsOfStudy } = useFieldsOfStudy()
   const { data: allLevelsOfStudy } = useLevelsOfStudy()

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

   return (
      <>
         <FormSectionHeader
            title="Target Students"
            subtitle="Select the target audience for this live stream"
            divider
         />
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
         {general.targetCountries.length === 0 ? (
            <BrandedTextField
               disabled
               label="By university"
               value="Please first select your target countries"
            />
         ) : (
            <MultiChipSelect
               id="targetUniversities"
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
            options={allFieldsOfStudy}
            value={general.targetFieldsOfStudy}
            limit={GROUP_CONSTANTS.MAX_TARGET_FIELD_OF_STUDY_COUNT}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "By field of study",
               placeholder: "Select fields of study",
               required: true,
            }}
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

export default AudienceTargeting
