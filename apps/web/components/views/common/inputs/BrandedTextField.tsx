import { FilledInputProps } from "@mui/material"
import TextField, { FilledTextFieldProps } from "@mui/material/TextField"
import { darken, styled } from "@mui/material/styles"

const BrandedTextField = styled(
   (props: Omit<FilledTextFieldProps, "variant">) => (
      <TextField
         variant="filled"
         InputProps={{ disableUnderline: true } as Partial<FilledInputProps>}
         {...props}
      />
   )
)(({ theme }) => ({
   "& label": {
      color: "#9999B1",
   },
   "& label.Mui-focused": {
      color: "#9999B1",
   },
   "& .MuiFilledInput-root": {
      borderRadius: theme.spacing(1),
      border: "1px solid",
      borderColor: "#EDE7FD",
      "&:hover": {
         backgroundColor: darken("#F7F8FC", 0.015),
      },
      backgroundColor: "#F7F8FC",
   },
}))

export default BrandedTextField
