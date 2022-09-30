import React, { ChangeEvent } from "react"
import { Collapse, FormControl, FormHelperText, TextField } from "@mui/material"

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
   touched?: boolean | any
}
const FirstName = ({
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
            autoComplete="given-name"
            name="firstName"
            variant="outlined"
            fullWidth
            id="firstName"
            label="First Name"
            autoFocus
            inputProps={{
               maxLength: 50,
            }}
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

export default FirstName
