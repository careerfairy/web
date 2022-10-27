import React, { useEffect, useState } from "react"
import Autocomplete from "@mui/material/Autocomplete"
import { withFirebase } from "../../../context/firebase/FirebaseServiceContext"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import {
   Collapse,
   FormControl,
   FormHelperText,
   TextField,
   CircularProgress,
} from "@mui/material"

const otherObj = { name: "Other", id: "other" }
const UniversitySelector = ({
   firebase,
   universityCountryCode,
   setFieldValue,
   error,
   submitting,
   values,
   className = "",
}) => {
   const [open, setOpen] = useState(false)
   const [universities, setUniversities] = useState([otherObj])
   const [loading, setLoading] = useState(false)

   useEffect(() => {
      if (universityCountryCode && universityCountryCode.length) {
         ;(async () => {
            try {
               setUniversities([otherObj])
               setLoading(true)
               if (universityCountryCode !== "OTHER") {
                  const querySnapshot =
                     await firebase.getUniversitiesFromCountryCode(
                        universityCountryCode
                     )
                  const fetchedUniversities = querySnapshot.data().universities
                  setUniversities([...fetchedUniversities, otherObj])
               } else {
                  setFieldValue("university", otherObj)
               }
               return setLoading(false)
            } catch (e) {
               console.log("error in fetch universities", e)
               return setLoading(false)
            }
         })()

         return () => setUniversities([otherObj])
      }
   }, [universityCountryCode])

   const getSelectedItem = () => {
      // Autocomplete will always complain because of async filtering... :( So ignore the warning
      const item = universities.find(
         (uni) => uni.id === values.university?.code
      )
      return item || otherObj
   }

   return (
      <Autocomplete
         id="university"
         name="university"
         fullWidth
         blurOnSelect
         data-testid={"university-selector"}
         disabled={submitting}
         selectOnFocus
         autoHighlight
         onChange={(e, value) => {
            if (value) {
               setFieldValue("university", {
                  code: value.id,
                  name: value.name,
               })
            } else {
               setFieldValue("university", {
                  code: otherObj.id,
                  name: otherObj.name,
               })
            }
         }}
         open={open}
         onOpen={() => {
            setOpen(true)
         }}
         onClose={() => {
            setOpen(false)
         }}
         getOptionLabel={(option) => option.name || ""}
         value={getSelectedItem()}
         isOptionEqualToValue={(option, value) => option.id === value.id}
         options={universities}
         loading={loading}
         renderInput={(params) => (
            <FormControl error={Boolean(error)} fullWidth>
               <TextField
                  {...params}
                  className={className}
                  error={Boolean(error)}
                  id="university"
                  name="university"
                  label="University"
                  disabled={submitting}
                  variant="outlined"
                  InputProps={{
                     ...params.InputProps,
                     endAdornment: (
                        <React.Fragment>
                           {loading ? (
                              <CircularProgress color="inherit" size={20} />
                           ) : null}
                           {params.InputProps.endAdornment}
                        </React.Fragment>
                     ),
                  }}
               />
               <Collapse in={Boolean(error)}>
                  <FormHelperText>{error}</FormHelperText>
               </Collapse>
            </FormControl>
         )}
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

export default withFirebase(UniversitySelector)
