import { FilledInputProps, InputLabelProps } from "@mui/material"
import TextField, { FilledTextFieldProps } from "@mui/material/TextField"
import { styled } from "@mui/material/styles"
import { Field, FieldProps, useField } from "formik"
import { FC } from "react"

export type BrandedTextFieldProps = Omit<FilledTextFieldProps, "variant">

const BrandedTextField = styled((props: BrandedTextFieldProps) => (
   <TextField
      variant="filled"
      InputProps={Object.assign({}, props.InputProps, inputProps)}
      InputLabelProps={Object.assign(
         {},
         props.InputLabelProps,
         inputLabelProps
      )}
      {...props}
   />
))(({ theme }) => ({
   "& label": {
      color: theme.palette.mode === "dark" ? undefined : "#9999B1",
      maxWidth: "calc(100% - 48px)",
   },
   "& label.Mui-focused": {
      color: "#9999B1",
   },
   "& .MuiFilledInput-root": {
      borderRadius: theme.spacing(1),
      border: "1px solid",
      borderColor: theme.palette.mode === "dark" ? "#EDE7FD" : "#ccc",
      backgroundColor: theme.palette.mode === "dark" ? undefined : "#F7F8FC",
   },
}))

const inputProps: Partial<FilledInputProps> = {
   disableUnderline: true,
}
const inputLabelProps: Partial<InputLabelProps> = {
   shrink: true,
}

export const BrandedTextFieldField: FC<BrandedTextFieldProps> = ({
   name,
   ...props
}) => {
   const [field, meta] = useField(name)

   return (
      <BrandedTextField
         {...field}
         {...props}
         error={meta.touched ? Boolean(meta.error) : null}
         helperText={meta.touched ? meta.error : null}
      />
   )
}

export default BrandedTextField
