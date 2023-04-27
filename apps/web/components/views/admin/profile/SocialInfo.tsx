import {
   Box,
   Collapse,
   FormControl,
   FormHelperText,
   TextField,
   Tooltip,
   Typography,
} from "@mui/material"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import React from "react"
import { FormikErrors, FormikValues } from "formik"
import { FormikTouched } from "formik/dist/types"

type Props = {
   handleChange: (event) => void
   values: FormikValues
   handleBlur: (event) => void
   errors: FormikErrors<FormikValues>
   touched: FormikTouched<FormikValues>
   isSubmitting: boolean
}

const SocialInfo = ({
   isSubmitting,
   handleChange,
   handleBlur,
   values,
   errors,
   touched,
}: Props) => {
   return (
      <Box>
         <Typography variant={"h5"} fontWeight={600}>
            Social
         </Typography>
         <Box mt={4}>
            <FormControl fullWidth>
               <TextField
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                     endAdornment: (
                        <Tooltip
                           color={"secondary"}
                           title={
                              "We always request your consent before publishing it"
                           }
                        >
                           <InfoIcon />
                        </Tooltip>
                     ),
                  }}
                  variant="outlined"
                  fullWidth
                  id="linkedinUrl"
                  label="LinkedIn"
                  name="linkedinUrl"
                  placeholder="Include your LinkedIn account to attract more young talent."
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  value={values.linkedinUrl}
                  error={Boolean(
                     errors.linkedinUrl &&
                        touched.linkedinUrl &&
                        errors.linkedinUrl
                  )}
                  onChange={handleChange}
               />
               <Collapse
                  in={Boolean(
                     errors.linkedinUrl &&
                        touched.linkedinUrl &&
                        errors.linkedinUrl
                  )}
               >
                  <FormHelperText error>{errors.linkedinUrl}</FormHelperText>
               </Collapse>
            </FormControl>
         </Box>
      </Box>
   )
}

export default SocialInfo
