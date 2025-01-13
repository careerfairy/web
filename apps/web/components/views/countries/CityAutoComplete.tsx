import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CityOption } from "@careerfairy/shared-lib/countries/types"
import { Autocomplete, TextField } from "@mui/material"
import useCountryCities from "components/custom-hook/countries/useCountryCities"
import { useMemo } from "react"

type CityAutoCompleteProps = {
   value?: OptionGroup
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
   const { data: citiesList } = useCountryCities(countryId)

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

   return (
      <>
         <Autocomplete
            loading={true}
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
         />
      </>
   )
}
