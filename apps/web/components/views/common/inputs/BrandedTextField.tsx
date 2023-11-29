import {
   Box,
   FilledInputProps,
   InputLabelProps,
   SelectProps,
   Typography,
   lighten,
} from "@mui/material"
import TextField, { FilledTextFieldProps } from "@mui/material/TextField"
import { styled } from "@mui/material/styles"
import { useField } from "formik"
import { FC, ReactElement } from "react"
import BrandedTooltip from "../tooltips/BrandedTooltip"
import InfoIcon from "@mui/icons-material/InfoOutlined"

export type BrandedTextFieldProps = Omit<FilledTextFieldProps, "variant">

function getBrandedTooltip(title: String): ReactElement<typeof BrandedTooltip> {
   return (
      <BrandedTooltip title={title}>
         <InfoIcon color="secondary" />
      </BrandedTooltip>
   )
}
const BrandedTextField = styled((props: BrandedTextFieldProps) => (
   <TextField
      variant="filled"
      {...props}
      label={
         <Typography>
            <Box
               component="span"
               display="flex"
               alignItems="center center"
               columnGap={1}
               rowGap={0}
            >
               <span> {props.label} </span>
               {props.requiredText ? <span>{props.requiredText}</span> : null}
               {props.tooltipText ? getBrandedTooltip(props.tooltipText) : null}
            </Box>
         </Typography>
      }
      InputProps={Object.assign({}, inputProps, props.InputProps)}
      InputLabelProps={Object.assign(
         {},
         inputLabelProps,
         props.InputLabelProps
      )}
      SelectProps={Object.assign({}, selectProps, props.SelectProps)}
   />
))(({ theme, error, size }) => ({
   "& label": {
      color: theme.palette.mode === "dark" ? undefined : "#9999B1",
      maxWidth: "calc(100% - 48px)",
   },
   "& label span": {
      fontWeight: 500,
      color: "#6F6F80",
   },
   "& label.Mui-focused": {
      color: "#9999B1",
   },
   "& .MuiFilledInput-root": {
      borderRadius: theme.spacing(1),
      border: "1px solid",
      borderColor: error
         ? theme.palette.error.main
         : theme.palette.mode === "dark"
         ? "#ccc"
         : "#EDE7FD",
      backgroundColor: theme.palette.mode === "dark" ? undefined : "#F7F8FC",
   },
}))

const inputProps: Partial<FilledInputProps> = {
   disableUnderline: true,
}
const inputLabelProps: Partial<InputLabelProps> = {
   shrink: true,
}
const selectProps: Partial<SelectProps> = {
   MenuProps: {
      sx: {
         "& .Mui-selected": {
            backgroundColor: `#FCFCFC !important`,
         },
         "& .MuiMenuItem-root": {
            backgroundColor: "white",
            ":hover": {
               backgroundColor: `${lighten("#FCFCFC", 0.1)} !important}`,
            },
         },
      },
   },
}

export const BrandedTextFieldField: FC<BrandedTextFieldProps> = ({
   name,
   ...props
}) => {
   const [field, meta] = useField(name)

   return (
      <BrandedTextField
         {...field}
         error={meta.touched ? Boolean(meta.error) : null}
         helperText={meta.touched ? meta.error : null}
         {...props}
      />
   )
}

export default BrandedTextField
