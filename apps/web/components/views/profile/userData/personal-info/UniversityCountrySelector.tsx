import { universityCountriesMap } from "components/util/constants/universityCountries"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { useFormContext } from "react-hook-form"

type Props = {
   name: string
   universityFieldName: string
}

const countryKeys = Object.keys(universityCountriesMap)

export const UniversityCountrySelector = ({
   name,
   universityFieldName,
}: Props) => {
   const {
      setValue,
      formState: { isSubmitting },
   } = useFormContext()

   return (
      <ControlledBrandedAutoComplete
         label="Select Country of University"
         name={name}
         options={countryKeys}
         autocompleteProps={{
            id: "universityCountryCode",
            disabled: isSubmitting,
            disableClearable: true,
            autoHighlight: true,
            getOptionLabel: (option) => universityCountriesMap[option] || "",
            isOptionEqualToValue: (option, value) => option === value,
            onChange: () => {
               setValue(universityFieldName, null)
            },
         }}
      />
   )
}
