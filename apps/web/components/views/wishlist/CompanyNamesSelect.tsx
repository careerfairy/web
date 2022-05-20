import React, { useCallback } from "react"
import { Autocomplete, Chip, TextField } from "@mui/material"
interface CompanyNamesSelectProps {
   selectedCompanyNames: string[]
   error: string
   touched: boolean
   setFieldValue: (field: string, value: any) => void
   handleBlur: (event: any) => void
   disabled: boolean
   limit?: number
}
const CompanyNamesSelect = ({
   selectedCompanyNames,
   setFieldValue,
   error,
   touched,
   handleBlur,
   disabled,
   limit = 5,
}: CompanyNamesSelectProps) => {
   const limitReached = selectedCompanyNames.length >= limit
   const checkDisable = useCallback(
      (option) => limitReached && !selectedCompanyNames.includes(option),
      [limitReached, selectedCompanyNames]
   )
   return (
      <Autocomplete
         multiple
         id="companyNames"
         disabled={disabled}
         options={selectedCompanyNames.map((companyName) => companyName)}
         value={selectedCompanyNames}
         onChange={(event, newValue) => {
            setFieldValue("companyNames", newValue)
         }}
         getOptionDisabled={checkDisable}
         onBlur={handleBlur}
         defaultValue={[]}
         freeSolo
         renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => (
               <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
               />
            ))
         }
         renderInput={(params) => (
            <TextField
               {...params}
               name={"companyNames"}
               error={Boolean(error && touched && error)}
               helperText={error && touched && error}
               label="Company Names"
               placeholder="Enter some companies you wish to see"
            />
         )}
      />
   )
}

export default CompanyNamesSelect
