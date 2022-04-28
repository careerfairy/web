import React from "react"
import { Autocomplete, Chip, TextField } from "@mui/material"
interface CompanyNamesSelectProps {
   selectedCompanyNames: string[]
   error: string
   touched: boolean
   setFieldValue: (field: string, value: any) => void
   handleBlur: (event: any) => void
   disabled: boolean
}
const CompanyNamesSelect = ({
   selectedCompanyNames,
   setFieldValue,
   error,
   touched,
   handleBlur,
   disabled,
}: CompanyNamesSelectProps) => {
   return (
      <Autocomplete
         multiple
         id="companyNames"
         disabled={disabled}
         limitTags={5}
         options={selectedCompanyNames.map((companyName) => companyName)}
         value={selectedCompanyNames}
         onChange={(event, newValue) => {
            setFieldValue("companyNames", newValue)
         }}
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
               variant="filled"
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
