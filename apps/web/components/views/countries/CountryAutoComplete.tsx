import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { Autocomplete, TextField } from "@mui/material"
import useCountryById from "components/custom-hook/countries/useCountryById"
import { useCountrySearch } from "components/custom-hook/countries/useCountrySearch"
import { useEffect, useState } from "react"

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
   const { data: userCountry } = useCountryById(countryValueId, false)

   const [options, setOptions] = useState<CountryOption[]>([])
   const [inputValue, setInputValue] = useState(userCountry?.name ?? "")
   const [country, setCountry] = useState<CountryOption | null>(
      userCountry ?? null
   )

   const { data: countriesResult, isLoading } = useCountrySearch(inputValue)

   useEffect(() => {
      const newOptions = countriesResult ?? []

      if (
         userCountry &&
         !newOptions.find((option) => option.id === userCountry.id)
      ) {
         newOptions.unshift(userCountry)
      }

      setOptions(newOptions)
   }, [countriesResult, userCountry])

   useEffect(() => {
      setCountry(userCountry ?? null)
   }, [userCountry, options])

   return (
      <Autocomplete
         value={country}
         disabled={disabled || isLoading}
         options={options}
         loading={isLoading}
         onChange={(_, value) => {
            setCountry(value ?? null)
            handleSelectedCountryChange(value ?? null)
         }}
         onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue)
         }}
         filterOptions={(x) => x}
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
