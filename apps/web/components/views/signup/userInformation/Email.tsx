import React, { ChangeEvent } from "react"
import { Collapse, FormControl, FormHelperText, TextField } from "@mui/material"
import { FormikTouched } from "formik"

type Props = {
   value: string
   onChange: (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => void
   error?: any
   disabled?: boolean
   onBlur?: (
      event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => void
   touched?: boolean | FormikTouched<any> | FormikTouched<any>[]
}
// Tooltip information only, could be in a wrapper function
const EMAIL_TOOLTIP_INFO =
   "The email address won't be exposed to your talent community, but will be used to send technical documentation to prepare for live streams and Sparks."
const Email = ({
   onBlur,
   disabled,
   value,
   onChange,
   error,
   touched,
}: Props) => {
   return (
      <FormControl fullWidth>
         <TextField
            className="registrationInput"
            variant="outlined"
            fullWidth
            autoComplete="email"
            id="emailInput"
            name="email"
            placeholder="Email"
            label="Email Address"
            onBlur={onBlur}
            value={value}
            disabled={disabled}
            error={Boolean(error && touched && error)}
            onChange={onChange}
         />
         <Collapse in={Boolean(error && touched && error)}>
            <FormHelperText error>{error}</FormHelperText>
         </Collapse>
      </FormControl>
   )
}

export default Email
