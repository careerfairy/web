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
const PasswordRepeat = ({
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
            label="Confirm Password"
            autoComplete="current-password"
            id="confirmPasswordInput"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
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

export default PasswordRepeat
