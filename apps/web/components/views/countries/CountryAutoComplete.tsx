import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { Autocomplete, Skeleton, TextField } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCountriesList from "components/custom-hook/countries/useCountriesList"
import { useMemo, useState } from "react"

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
   return (
      <SuspenseWithBoundary
         fallback={
            <Skeleton
               variant="rectangular"
               height={50}
               sx={{ borderRadius: "8px" }}
            />
         }
      >
         <CountryAutoCompleteDropdown
            countryValueId={countryValueId}
            disabled={disabled}
            handleSelectedCountryChange={handleSelectedCountryChange}
         />
      </SuspenseWithBoundary>
   )
}

export const CountryAutoCompleteDropdown = ({
   countryValueId,
   disabled,
   handleSelectedCountryChange,
}: CountryAutoCompleteProps) => {
   const { data: countriesList } = useCountriesList()

   const [country, setCountry] = useState<OptionGroup | null>(() => {
      return countryValueId ? countriesList[countryValueId] : null
   })

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

   return (
      <Autocomplete
         value={country}
         disabled={disabled}
         options={countriesOptions}
         onChange={(_, value) => {
            setCountry(value?.id ? countriesList[value.id] : null)
            handleSelectedCountryChange(
               value?.id ? countriesList[value.id] : null
            )
         }}
         getOptionLabel={(option) => option.name}
         getOptionKey={(option) => option.id}
         isOptionEqualToValue={(option, value) => option.id === value?.id}
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
