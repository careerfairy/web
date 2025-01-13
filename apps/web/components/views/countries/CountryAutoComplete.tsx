import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { Autocomplete, TextField } from "@mui/material"
import useCountriesList from "components/custom-hook/countries/useCountriesList"
import { useEffect, useMemo, useState } from "react"

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
   const { data: countriesList, isLoading } = useCountriesList(false)

   const [country, setCountry] = useState<OptionGroup | null>(null)

   const countriesOptions = useMemo(() => {
      return (
         Object.keys(countriesList)?.map(
            (country) =>
               ({
                  id: country,
                  name: countriesList[country].name,
               } as OptionGroup)
         ) ?? []
      )
   }, [countriesList])

   useEffect(() => {
      if (countryValueId && Boolean(countriesList[countryValueId])) {
         setCountry(countriesList[countryValueId])
      } else {
         setCountry(null)
      }
   }, [countryValueId, countriesList])

   return (
      <Autocomplete
         value={country}
         disabled={disabled}
         loading={isLoading}
         options={countriesOptions}
         onChange={(_, value) => {
            setCountry(value?.id ? countriesList[value.id] : null)
            handleSelectedCountryChange(
               value?.id ? countriesList[value.id] : null
            )
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
