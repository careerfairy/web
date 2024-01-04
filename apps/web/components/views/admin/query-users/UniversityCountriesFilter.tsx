import React from "react"
import { TextField } from "@mui/material"
import VirtualizedAutocomplete from "../../common/VirtualizedAutocomplete"
import { UniversityCountry } from "@careerfairy/shared-lib/dist/universities"
import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/dist/bigQuery/types"

interface Props {
   universityCountries: UniversityCountry[]
   setOptions: React.Dispatch<React.SetStateAction<BigQueryUserQueryOptions>>
   queryOptions: BigQueryUserQueryOptions
   universityCountriesLookup: Record<string, string>
}
const UniversityCountriesFilter = ({
   universityCountries,
   setOptions,
   queryOptions,
   universityCountriesLookup,
}: Props) => {
   return (
      <VirtualizedAutocomplete // must use VirtualizedAutocomplete to avoid performance issues, page freezes when using non-virtualized autocomplete
         options={universityCountries}
         disableCloseOnSelect
         multiple
         freeSolo={false} // must be false to avoid typescript error, if left undefined, T could be T | string, but we only want T
         noOptionsText={"All universities"}
         onChange={(event, items) => {
            setOptions((prev) => ({
               ...prev,
               filters: {
                  ...prev.filters,
                  universityCountryCodes: items.map((item) => item.id),
                  universityCodes: prev.filters.universityCodes.filter(
                     (universityCode) =>
                        items.some((item) =>
                           item.universities.some(
                              (university) => university.id === universityCode
                           )
                        )
                  ), // remove universities that are not in the selected countries
               },
               page: 0,
            }))
         }}
         size="small"
         value={universityCountries.filter((universityCountry) =>
            queryOptions.filters.universityCountryCodes.includes(
               universityCountry.id
            )
         )}
         isOptionEqualToValue={(option, value) => option.id === value.id}
         sx={{ minWidth: 200 }}
         getOptionLabel={(option) =>
            universityCountriesLookup[option.id] || option.id
         }
         // @ts-ignore
         renderOption={(props, option) => [
            props,
            universityCountriesLookup[option.id] || option.id,
         ]}
         fullWidth
         renderInput={(params) => (
            <TextField
               {...params}
               name={"universityCountry"}
               label={"University Country"}
            />
         )}
      />
   )
}

export default UniversityCountriesFilter
