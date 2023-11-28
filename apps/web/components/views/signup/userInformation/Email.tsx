import React, { ChangeEvent } from "react"
import { Collapse, FormControl, FormHelperText, TextField } from "@mui/material"
import { FormikTouched } from "formik"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import { EMAIL_TOOLTIP_INFO } from "constants/pages"

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
