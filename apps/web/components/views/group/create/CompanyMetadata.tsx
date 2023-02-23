import React, { useCallback } from "react"
import { FormikErrors, FormikValues } from "formik"
import { FormikTouched } from "formik/dist/types"
import GenericDropdown from "../../common/GenericDropdown"
import {
   CompanyCountryValues,
   CompanyIndustryValues,
   CompanySizesCodes,
} from "../../../../constants/forms"
import { Autocomplete, Box, Collapse, TextField } from "@mui/material"

type Props = {
   handleChange: (event) => void
   values: FormikValues
   handleBlur: (event) => void
   errors: FormikErrors<FormikValues>
   touched: FormikTouched<FormikValues>
   isSubmitting: boolean
   inputsRequired?: boolean
   horizontalDirection?: boolean
}

const CompanyMetadata = ({
   handleChange,
   values,
   handleBlur,
   errors,
   touched,
   isSubmitting,
   inputsRequired,
   horizontalDirection,
}: Props) => {
   const handleSelect = useCallback(
      (id, newValue) => handleChange({ target: { id, value: newValue } }),
      [handleChange]
   )

   return (
      <>
         <Box width={horizontalDirection ? "30%" : "100%"}>
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
                     label={`Company location${inputsRequired ? " *" : ""}`}
                     variant="outlined"
                     error={Boolean(
                        errors.companyCountry && touched.companyCountry
                     )}
                     onBlur={handleBlur}
                     disabled={isSubmitting}
                  />
               )}
            />
            <Collapse
               in={Boolean(errors.companyCountry && touched.companyCountry)}
               style={{ color: "red" }}
            >
               {errors.companyCountry}
            </Collapse>
         </Box>

         <Box width={horizontalDirection ? "30%" : "100%"}>
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
                     label={`Company industry${inputsRequired ? " *" : ""}`}
                     variant="outlined"
                     fullWidth
                     error={Boolean(
                        errors.companyIndustry && touched.companyIndustry
                     )}
                     onBlur={handleBlur}
                     disabled={isSubmitting}
                  />
               )}
            />
            <Collapse
               in={Boolean(errors.companyIndustry && touched.companyIndustry)}
               style={{ color: "red" }}
            >
               {errors.companyIndustry}
            </Collapse>
         </Box>

         <Box width={horizontalDirection ? "30%" : "100%"}>
            <GenericDropdown
               id="companySize-dropdown"
               name="companySize"
               onChange={handleChange}
               value={values.companySize}
               label={`Company size${inputsRequired ? " *" : ""}`}
               list={CompanySizesCodes}
               error={Boolean(errors.companySize && touched.companySize)}
               onBlur={handleBlur}
               disabled={isSubmitting}
            />
            <Collapse
               in={Boolean(errors.companySize && touched.companySize)}
               style={{ color: "red" }}
            >
               {errors.companySize}
            </Collapse>
         </Box>
      </>
   )
}

export default CompanyMetadata
