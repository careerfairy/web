import React from "react"
import { TextField } from "@mui/material"
import VirtualizedAutocomplete from "../../common/VirtualizedAutocomplete"
import { University } from "@careerfairy/shared-lib/dist/universities"
import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/dist/bigQuery/types"

interface Props {
   universityOptions: University[]
   setOptions: React.Dispatch<React.SetStateAction<BigQueryUserQueryOptions>>
   queryOptions: BigQueryUserQueryOptions
}
const UniversitiesFilter = ({
   universityOptions,
   setOptions,
   queryOptions,
}: Props) => {
   return (
      <VirtualizedAutocomplete // must use VirtualizedAutocomplete to avoid performance issues, page freezes when using non-virtualized autocomplete
         options={universityOptions}
         disableCloseOnSelect
         value={universityOptions.filter((university) =>
            queryOptions.filters.universityCodes.includes(university.id)
         )}
         multiple
         openOnFocus
         freeSolo={false} // must be false to avoid typescript error, if left undefined, T could be T | string, but we only want T
         noOptionsText={"All universities"}
         onChange={(event, items) => {
            setOptions((prev) => ({
               ...prev,
               filters: {
                  ...prev.filters,
                  universityCodes: items.map((item) => item.id),
               },
               page: 0,
            }))
         }}
         isOptionEqualToValue={(option, value) => option.id === value.id}
         sx={{ minWidth: 200 }}
         getOptionLabel={(option) => option.name}
         // @ts-ignore
         renderOption={(props, option) => [props, option.name]}
         fullWidth
         size="small"
         renderInput={(params) => (
            <TextField {...params} name={"university"} label={"University"} />
         )}
      />
   )
}

export default UniversitiesFilter
