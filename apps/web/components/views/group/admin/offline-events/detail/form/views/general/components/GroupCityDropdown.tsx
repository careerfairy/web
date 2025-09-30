import useCountryStates from "components/custom-hook/countries/useCountryStates"
import { FormBrandedAutocomplete } from "components/views/common/inputs/BrandedAutocomplete"
import { useField } from "formik"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventCreationContext } from "../../../../OfflineEventCreationContext"

const styles = sxStyles({
   cityDropdown: {
      "& .MuiAutocomplete-inputRoot.Mui-focused": {
         borderColor: (theme) => theme.brand.purple[300],
      },
   },
})

type GroupCityDropdownProps = {
   fieldName: string
   label?: string
   placeholder?: string
   disabled?: boolean
   requiredText?: string
}

export const GroupCityDropdown = ({
   fieldName,
   label = "City",
   placeholder = "E.g., Zurich",
   disabled = false,
   requiredText = null,
}: GroupCityDropdownProps) => {
   const { group } = useOfflineEventCreationContext()
   const [field, , helpers] = useField(fieldName)

   const { data: countryStates, isLoading } = useCountryStates(
      group.companyCountry?.id,
      false
   )

   const handleCityChange = (_, value: string) => {
      const cityData = countryStates[value]
      if (cityData) {
         helpers.setValue({
            ...field.value,
            id: value,
            name: cityData.name,
         })
      }
   }

   return (
      <FormBrandedAutocomplete
         name={fieldName}
         options={!isLoading ? Object.keys(countryStates) : []}
         textFieldProps={{
            label,
            requiredText,
            placeholder,
            sx: styles.cityDropdown,
         }}
         getOptionLabel={(option) =>
            (option && countryStates[option]?.name) || ""
         }
         isOptionEqualToValue={(option, value) => option === value}
         onChange={handleCityChange}
         value={field.value?.id}
         loading={isLoading}
         disabled={disabled || isLoading}
         disableClearable
         autoHighlight
         selectOnFocus={false}
         loadingText="Loading cities.."
      />
   )
}

export default GroupCityDropdown
