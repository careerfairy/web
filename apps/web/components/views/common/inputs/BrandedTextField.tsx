import { FilledInputProps } from "@mui/material"
import TextField, { FilledTextFieldProps } from "@mui/material/TextField"
import { styled } from "@mui/material/styles"

const BrandedTextField = styled(
   (props: Omit<FilledTextFieldProps, "variant">) => (
      <TextField variant="filled" InputProps={inputProps} {...props} />
   )
)(({ theme }) => ({
   "& label": {
      color: theme.palette.mode === "dark" ? undefined : "#9999B1",
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

const inputProps: Partial<FilledInputProps> = { disableUnderline: true }

export default BrandedTextField
