import { useFormContext, useWatch } from "react-hook-form"
import { useMemo } from "react"
import useUniversitiesByCountryCodes from "components/custom-hook/useUniversities"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { OTHER_UNIVERSITY_OPTION, filterWithOther } from "./util"

type Props = {
   name: string
   countryCodesName: string
}

export const UniversitySelector = ({ name, countryCodesName }: Props) => {
   const {
      formState: { isSubmitting },
   } = useFormContext()

   const selectedCountryCode = useWatch({
      name: countryCodesName,
   })

   const countryCodes = useMemo(() => {
      return [selectedCountryCode]
   }, [selectedCountryCode])

   const universities = useUniversitiesByCountryCodes(countryCodes)

   const options = useMemo(() => {
      const newOptions =
         universities?.map((university) => ({
            id: university.id,
            value: university.name,
         })) || []

      return [OTHER_UNIVERSITY_OPTION, ...newOptions]
   }, [universities])

   return (
      <ControlledBrandedAutoComplete
         label="Select University"
         name={name}
         options={options}
         autocompleteProps={{
            id: "universityCountryCode",
            disabled: isSubmitting,
            autoHighlight: true,
            disableClearable: true,
            // @ts-ignore
            ["data-testid"]: "university-country-selector",
            filterOptions: filterWithOther,
         }}
      />
   )
}
