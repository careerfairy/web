import React from "react"
import { Autocomplete } from "@mui/material"
import { languageCodes } from "./index"
import { TextField } from "@mui/material"

export const LanguageSelect = ({ name, value, setFieldValue, ...rest }) => {
   const handleChange = (event, newValue) => {
      setFieldValue(name, newValue)
   }
   return (
      <Autocomplete
         {...rest}
         name={name}
         id={name}
         options={languageCodes}
         defaultValue={value}
         isOptionEqualToValue={(option, value) => option.code === value.code}
         getOptionLabel={(option) => option.name || ""}
         value={value}
         disableClearable
         onChange={handleChange}
         renderInput={(params) => (
            <TextField
               {...params}
               label="Chose a preferred language"
               variant="outlined"
               fullWidth
            />
         )}
      />
   )
}
