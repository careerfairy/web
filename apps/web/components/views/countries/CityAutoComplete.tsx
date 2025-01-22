import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CityOption } from "@careerfairy/shared-lib/countries/types"
import { Autocomplete, TextField } from "@mui/material"
import { useCitySearch } from "components/custom-hook/countries/useCitySearch"
import { useEffect, useState } from "react"

const MIN_SEARCH_LENGTH = 2

type CityAutoCompleteProps = {
   value?: OptionGroup | null
   disabled?: boolean
   countryId?: string
   handleSelectedCityChange: (city: CityOption | null) => void
   loading?: boolean
   onFocus?: () => void
}

export const CityAutoComplete = ({
   value,
   disabled,
   countryId,
   handleSelectedCityChange,
   loading,
   onFocus,
}: CityAutoCompleteProps) => {
   const [options, setOptions] = useState<CityOption[]>([])
   const [inputValue, setInputValue] = useState(value?.name ?? "")
   const [city, setCity] = useState<CityOption | null>(value ?? null)

   const {
      data: citiesResult,
      isLoading,
      mutate,
   } = useCitySearch(inputValue, countryId)

   useEffect(() => {
      const newOptions = citiesResult ?? []

      if (value && !newOptions.find((option) => option.id === value.id)) {
         newOptions.unshift(value)
      }

      setOptions(newOptions)
   }, [citiesResult, value])

   useEffect(() => {
      setCity(value ?? null)
   }, [value, options])

   useEffect(() => {
      setCity(null)
      setOptions([])
      setInputValue("")
   }, [countryId, mutate])

   return (
      <Autocomplete
         loading={isLoading || loading}
         value={city}
         disabled={disabled}
         options={options}
         onChange={(_, value) => handleSelectedCityChange(value ?? null)}
         onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue)
         }}
         noOptionsText={
            inputValue.length >= MIN_SEARCH_LENGTH
               ? "No results found"
               : "Start typing to search (at least 2 characters)"
         }
         onFocus={onFocus}
         filterOptions={(x) => x}
         getOptionLabel={(option) => option.name}
         getOptionKey={(option) => option.id}
         isOptionEqualToValue={(option, value) => option.id === value?.id}
         renderInput={(params) => (
            <TextField
               {...params}
               label="And your city?"
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
