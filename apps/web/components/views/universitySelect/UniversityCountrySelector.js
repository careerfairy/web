import React from "react"
import { Collapse, FormControl, FormHelperText, TextField } from "@mui/material"
import { universityCountries } from "../../util/constants/universityCountries"
import Autocomplete from "@mui/material/Autocomplete"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"

const otherObj = { code: "OTHER", name: "Other" }

const UniversityCountrySelector = ({
   handleClose,
   handleOpen,
   open,
   value,
   setFieldValue,
   submitting,
   error,
   className = "",
}) => {
   const getSelectedItem = () => {
      // Autocomplete will always complain because of async filtering... :( So ignore the warning
      const item = universityCountries.find((country) => country.code === value)
      return item || otherObj
   }

   return (
      <Autocomplete
         id="universityCountryCode"
         name="universityCountryCode"
         fullWidth
         data-testid={"university-country-selector"}
         disabled={submitting}
         selectOnFocus
         blurOnSelect
         autoHighlight
         autoComplete={false}
         onChange={(e, value) => {
            setFieldValue("universityCountryCode", value?.code || otherObj.code)
         }}
         open={open}
         onOpen={handleOpen}
         onClose={handleClose}
         getOptionLabel={(option) => option.name || ""}
         value={getSelectedItem()}
         isOptionEqualToValue={(option, value) => option.code === value.code}
         options={universityCountries}
         renderInput={(params) => {
            const inputProps = params.inputProps
            inputProps.autoComplete = "new-password"
            return (
               <FormControl error={Boolean(error)} fullWidth>
                  <TextField
                     {...params}
                     className={className}
                     inputProps={inputProps}
                     error={Boolean(error)}
                     autoComplete="none"
                     id="universityCountryCode"
                     name="universityCountryCode"
                     label="Select Country of University"
                     disabled={submitting}
                     variant="outlined"
                     InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                           <React.Fragment>
                              {params.InputProps.endAdornment}
                           </React.Fragment>
                        ),
                        autoComplete: "new-password",
                        form: {
                           autoComplete: "new-password",
                        },
                     }}
                  />
                  <Collapse in={Boolean(error)}>
                     <FormHelperText>{error}</FormHelperText>
                  </Collapse>
               </FormControl>
            )
         }}
         renderOption={(props, option, { inputValue }) => {
            const matches = match(option.name, inputValue)
            const parts = parse(option.name, matches)

            return (
               <li {...props}>
                  <div>
                     {parts.map((part, index) => (
                        <span
                           key={index}
                           style={{
                              fontWeight: part.highlight ? 700 : 400,
                           }}
                        >
                           {part.text}
                        </span>
                     ))}
                  </div>
               </li>
            )
         }}
      />
   )
}

export default UniversityCountrySelector
