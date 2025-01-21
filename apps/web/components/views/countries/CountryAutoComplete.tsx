import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { Autocomplete, TextField } from "@mui/material"
import { universityCountriesMap } from "components/util/constants/universityCountries"
import { useState } from "react"

const countries = Object.keys(universityCountriesMap).map((key) => ({
   id: key,
   name: universityCountriesMap[key],
}))

type CountryAutoCompleteProps = {
   countryValueId?: string
   disabled?: boolean
   handleSelectedCountryChange: (country: CountryOption | null) => void
}

export const CountryAutoComplete = ({
   countryValueId,
   disabled,
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
         options={countries}
         onChange={(_, value) => {
            setCountry(value ?? null)
            handleSelectedCountryChange(value ?? null)
         }}
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
         sx={{
            "& .MuiInputBase-input": {
               fontWeight: 600,
               fontSize: "16px",
            },
         }}
      />
   )
}
