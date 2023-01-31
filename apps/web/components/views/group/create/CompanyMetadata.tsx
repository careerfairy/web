import React, { useCallback } from "react"
import { FormikErrors, FormikValues } from "formik"
import { FormikTouched } from "formik/dist/types"
import GenericDropdown from "../../common/GenericDropdown"
import {
   CompanyCountryValues,
   CompanyIndustryValues,
   CompanySizesCodes,
} from "../../../../constants/forms"
import { Autocomplete, TextField } from "@mui/material"

type Props = {
   handleChange: (event) => void
   values: FormikValues
   handleBlur: (event) => void
   errors: FormikErrors<FormikValues>
   touched: FormikTouched<FormikValues>
   isSubmitting: boolean
}

const CompanyMetadata = ({ handleChange, values }: Props) => {
   const handleSelect = useCallback(
      (id, newValue) => handleChange({ target: { id, value: newValue } }),
      [handleChange]
   )

   return (
      <>
         <Autocomplete
            id={"companyCountry"}
            options={CompanyCountryValues}
            defaultValue={values.companyCountry}
            getOptionLabel={(option) => option.name || ""}
            value={values.companyCountry}
            disableClearable
            onChange={(event, newValue) =>
               handleSelect("companyCountry", newValue)
            }
            renderInput={(params) => (
               <TextField
                  {...params}
                  label="Company location"
                  variant="outlined"
                  fullWidth
               />
            )}
         />

         <Autocomplete
            id={"companyIndustry"}
            options={CompanyIndustryValues}
            defaultValue={values.companyIndustry}
            getOptionLabel={(option) => option.name || ""}
            value={values.companyIndustry}
            disableClearable
            onChange={(event, newValue) =>
               handleSelect("companyIndustry", newValue)
            }
            renderInput={(params) => (
               <TextField
                  {...params}
                  label="Company industry"
                  variant="outlined"
                  fullWidth
               />
            )}
         />

         <GenericDropdown
            id="companySize-dropdown"
            name="companySize"
            onChange={handleChange}
            value={values.companySize}
            label="Company size"
            list={CompanySizesCodes}
         />
      </>
   )
}

export default CompanyMetadata
