import React from "react"
import { Autocomplete, Chip, TextField } from "@mui/material"
import { Interest } from "@careerfairy/shared-lib/dist/interests"
interface InterestSelectProps {
   selectedInterests: string[]
   totalInterests: Interest[]
   error: string
   touched: boolean
   setFieldValue: (field: string, value: any) => void
   handleBlur: (event: any) => void
   disabled: boolean
}
const InterestSelect = ({
   selectedInterests,
   totalInterests,
   setFieldValue,
   error,
   touched,
   handleBlur,
   disabled,
}: InterestSelectProps) => {
   return (
      <Autocomplete
         multiple
         id="interests"
         limitTags={5}
         disabled={disabled}
         options={totalInterests}
         getOptionLabel={(interest) => interest.name}
         value={selectedInterests}
         onChange={(event, newValue) => {
            console.log("-> newValue", newValue)
            setFieldValue("interests", newValue)
         }}
         onBlur={handleBlur}
         defaultValue={[]}
         freeSolo
         renderTags={(value: readonly Interest[], getTagProps) =>
            value.map((option: Interest, index: number) => (
               <Chip
                  variant="outlined"
                  label={option.name}
                  {...getTagProps({ index })}
               />
            ))
         }
         renderInput={(params) => (
            <TextField
               {...params}
               variant="filled"
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
