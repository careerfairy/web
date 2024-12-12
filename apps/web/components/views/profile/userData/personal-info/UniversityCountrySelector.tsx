import { universityCountriesMap } from "components/util/constants/universityCountries"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { useFormContext } from "react-hook-form"

type Props = {
   name: string
   universityFieldName: string
   label?: string
   placeholder?: string
   requiredText?: string
}

const countryKeys = Object.keys(universityCountriesMap)

export const UniversityCountrySelector = ({
   name,
   universityFieldName,
   label = "Select Country of University",
   placeholder,
   requiredText,
}: Props) => {
   const {
      setValue,
      formState: { isSubmitting },
   } = useFormContext()

   return (
      <ControlledBrandedAutoComplete
         label={label}
         name={name}
         options={countryKeys}
         textFieldProps={{
            requiredText: requiredText,
            placeholder: placeholder,
         }}
         autocompleteProps={{
            id: "universityCountryCode",
            disabled: isSubmitting,
            disableClearable: true,
            autoHighlight: true,
            selectOnFocus: false,
            getOptionLabel: (option) => universityCountriesMap[option] || "",
            isOptionEqualToValue: (option, value) => option === value,
            onChange: () => {
               setValue(universityFieldName, null)
            },
         }}
      />
   )
}
