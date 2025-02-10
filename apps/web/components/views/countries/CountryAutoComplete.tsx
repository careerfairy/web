import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { Autocomplete, TextField } from "@mui/material"
import {
   countryOptions,
   universityCountriesMap,
} from "components/util/constants/universityCountries"
import { useState } from "react"

type CountryAutoCompleteProps = {
   countryValueId?: string
   disabled?: boolean
   onFocus?: () => void
   handleSelectedCountryChange: (country: CountryOption | null) => void
}

export const CountryAutoComplete = ({
   countryValueId,
   disabled,
   onFocus,
   handleSelectedCountryChange,
}: CountryAutoCompleteProps) => {
   const [country, setCountry] = useState<CountryOption | null>(() => {
      return countryValueId
         ? {
              id: countryValueId,
              name: universityCountriesMap[countryValueId],
           }
         : null
   })

   return (
      <Autocomplete
         value={country}
         disabled={disabled}
         options={countryOptions}
         onChange={(_, value) => {
            setCountry(value ?? null)
            handleSelectedCountryChange(value ?? null)
         }}
         onFocus={onFocus}
         getOptionLabel={(option) => option.name}
         getOptionKey={(option) => option.id}
         isOptionEqualToValue={(option, value) => option?.id === value?.id}
         renderInput={(params) => (
            <TextField
               {...params}
               label="What's your country?"
               className="registrationInput"
            />
         )}
      />
   )
}
