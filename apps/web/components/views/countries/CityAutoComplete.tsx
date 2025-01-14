import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CityOption } from "@careerfairy/shared-lib/countries/types"
import { Autocomplete, TextField } from "@mui/material"
import useCountryCities from "components/custom-hook/countries/useCountryCities"
import { useEffect, useMemo } from "react"

type CityAutoCompleteProps = {
   value?: OptionGroup | null
   disabled?: boolean
   countryId?: string
   handleSelectedCityChange: (city: CityOption | null) => void
}

export const CityAutoComplete = ({
   value,
   disabled,
   countryId,
   handleSelectedCityChange,
}: CityAutoCompleteProps) => {
   const {
      data: citiesList,
      isLoading,
      mutate,
   } = useCountryCities(countryId, false)

   const citiesOptions = useMemo(() => {
      return (
         Object.keys(citiesList)?.map(
            (city) =>
               ({
                  id: city,
                  name: citiesList[city].name,
               } as OptionGroup)
         ) ?? []
      )
   }, [citiesList])

   useEffect(() => {
      mutate()
   }, [countryId, mutate])

   const filterOptions = (
      options: OptionGroup[],
      { inputValue }: { inputValue: string }
   ) => {
      const searchText = inputValue.toLowerCase().trim()

      if (!searchText) {
         return options
      }

      return options.filter((option) => {
         const cityName = option.name.toLowerCase()
         let searchIndex = 0
         let cityIndex = 0

         // Try to find all characters from searchText in order in cityName
         while (
            searchIndex < searchText.length &&
            cityIndex < cityName.length
         ) {
            if (searchText[searchIndex] === cityName[cityIndex]) {
               searchIndex++
            }
            cityIndex++
         }

         // If we found all characters, it's a match
         return searchIndex === searchText.length
      })
   }

   return (
      <Autocomplete
         loading={isLoading}
         value={value}
         disabled={disabled}
         options={citiesOptions}
         onChange={(_, value) =>
            handleSelectedCityChange(value?.id ? citiesList[value.id] : null)
         }
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
         filterOptions={filterOptions}
      />
   )
}
