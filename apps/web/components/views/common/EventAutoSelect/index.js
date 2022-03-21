import React from "react"
import { Autocomplete } from "@mui/material"
import { TextField } from "@mui/material"
import EventOptionPreview from "./EventOptionPreview"

const EventAutoSelect = ({
   onChange,
   value,
   inputValue,
   onInputChange,
   options,
   ...rest
}) => {
   return (
      <Autocomplete
         value={value}
         onChange={onChange}
         inputValue={inputValue}
         onInputChange={onInputChange}
         isOptionEqualToValue={(option, value) =>
            option.title === value.title || option.company === value.company
         }
         filterSelectedOptions
         getOptionLabel={(option) => option.title || ""}
         id="event-select-menu"
         renderOption={(props, option, { selected }) => (
            <li {...props}>
               <EventOptionPreview selected={selected} streamData={option} />
            </li>
         )}
         options={options}
         renderInput={(params) => (
            <TextField {...params} label="Chose an Event" variant="outlined" />
         )}
         {...rest}
      />
   )
}

export default EventAutoSelect
