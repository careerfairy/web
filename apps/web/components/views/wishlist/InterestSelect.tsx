import React, { useCallback } from "react"
import { Autocomplete, Checkbox, Chip, TextField } from "@mui/material"
import { Interest } from "@careerfairy/shared-lib/dist/interests"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
interface InterestSelectProps {
   selectedInterests: Interest[]
   totalInterests: Interest[]
   error: string
   touched: boolean
   setFieldValue: (field: string, value: any) => void
   handleBlur: (event: any) => void
   disabled: boolean
   limit?: number
}
const InterestSelect = ({
   selectedInterests,
   totalInterests,
   setFieldValue,
   error,
   touched,
   handleBlur,
   disabled,
   limit = 5,
}: InterestSelectProps) => {
   const limitReached = selectedInterests.length >= limit
   const checkDisable = useCallback(
      (option) => limitReached && !selectedInterests.includes(option),
      [limitReached, selectedInterests]
   )
   return (
      <Autocomplete
         multiple
         id="interests"
         disabled={disabled}
         getOptionDisabled={checkDisable}
         disableCloseOnSelect
         options={totalInterests}
         getOptionLabel={(interest) => interest.name}
         value={selectedInterests}
         onChange={(event, newValue) => {
            setFieldValue("interests", newValue)
         }}
         onBlur={handleBlur}
         defaultValue={[]}
         freeSolo
         renderOption={(props, option, { selected }) => (
            <li {...props}>
               <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
               />
               {option.name}
            </li>
         )}
         renderInput={(params) => (
            <TextField
               {...params}
               name={"interests"}
               error={Boolean(error && touched && error)}
               helperText={error && touched && error}
               label="Interests"
               placeholder="Chose some interests"
            />
         )}
      />
   )
}

export default InterestSelect
