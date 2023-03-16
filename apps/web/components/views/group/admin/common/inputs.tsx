import { styled } from "@mui/material/styles"
import { TextField } from "@mui/material"
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem"

export const StyledTextField: typeof TextField = styled(TextField)(() => ({
   "& .MuiOutlinedInput-root": {
      "& fieldset": {
         borderColor: "transparent",
      },
   },
   "& .MuiOutlinedInput-root.Mui-disabled": {
      "& fieldset": {
         borderColor: "transparent",
      },
   },
   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
   },
})) as typeof TextField // https://mui.com/material-ui/guides/typescript/#complications-with-the-component-prop

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
   [`&.${menuItemClasses.selected}`]: {
      backgroundColor: "transparent",
   },
   "&:hover": {
      backgroundColor: theme.palette.action.hover + " !important",
   },
   [`&.${menuItemClasses.focusVisible}`]: {
      backgroundColor: theme.palette.action.hover + " !important",
   },
})) as unknown as typeof MenuItem
