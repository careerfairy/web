import { styled } from "@mui/material/styles"
import { Box, Checkbox, CheckboxProps, TextField } from "@mui/material"
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import React from "react"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   checkboxIconWrapper: {
      width: 20,
      height: 20,
      borderRadius: 1,
      bgcolor: "tertiary.main",
      color: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
})

export const StyledTextField: typeof TextField = styled(TextField)(
   ({ theme }) => ({
      "& .MuiOutlinedInput-root": {
         "& fieldset": {
            borderColor: "transparent !important",
         },
      },
      "& input": {
         "&::placeholder": {
            color: theme.palette.text.primary,
            opacity: 1,
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
   })
) as typeof TextField // https://mui.com/material-ui/guides/typescript/#complications-with-the-component-prop

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
   [theme.breakpoints.down("sm")]: {
      minWidth: "auto !important",
   },
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

export const StyledCheckbox = (
   props: Omit<CheckboxProps, "color" | "icon" | "checkedIcon">
) => {
   return (
      <Checkbox
         {...props}
         color={"default"}
         icon={<Box sx={styles.checkboxIconWrapper} />}
         checkedIcon={
            <Box sx={styles.checkboxIconWrapper}>
               <CheckRoundedIcon fontSize={"small"} />
            </Box>
         }
      />
   )
}
