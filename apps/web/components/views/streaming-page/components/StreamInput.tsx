import { OutlinedInput } from "@mui/material"
import { styled } from "@mui/styles"

export const StreamInput = styled(OutlinedInput)(({ theme }) => ({
   borderRadius: "24px",
   "& textarea::placeholder": {
      color: theme.palette.neutral[300],
      opacity: 1,
   },
   "& .MuiOutlinedInput-notchedOutline": {
      m: "-4px",
      border: `1px solid ${theme.palette.neutral[100]}`,
   },
   "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.neutral[300],
   },
   "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent !important",
   },
   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${theme.brand.info[600]}`,
   },
   "& legend": {
      display: "none",
   },
   "& fieldset": { top: 0 },
}))
