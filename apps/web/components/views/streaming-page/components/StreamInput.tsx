import { OutlinedInput } from "@mui/material"
import { styled } from "@mui/styles"

export const StreamInput = styled(OutlinedInput)(({ theme }) => ({
   borderRadius: "24px",
   border: `1px solid ${theme.palette.neutral[100]}`,
   "& .MuiOutlinedInput-notchedOutline": {
      m: "-4px",
      borderColor: "transparent",
   },
   "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
   },
   "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent !important",
   },
   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.brand.info[600],
   },
   "& legend": {
      display: "none",
   },
   "& fieldset": { top: 0 },
}))
