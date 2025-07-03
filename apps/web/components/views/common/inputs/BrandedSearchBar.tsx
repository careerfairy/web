import { Box } from "@mui/material"
import { XCircleIcon } from "components/views/common/icons/XCircleIcon"
import { ChangeEvent } from "react"
import { Search } from "react-feather"
import { sxStyles } from "types/commonTypes"
import BrandedTextField from "./BrandedTextField"

const styles = sxStyles({
   searchField: {
      "& .MuiFilledInput-root": {
         background: (theme) => `${theme.brand.white[100]} !important`,
      },
      "& .MuiInputBase-root": {
         p: "4px 12px",
         height: "48px",
         borderRadius: "12px",
         border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
         background: (theme) => theme.brand.white[100],
         "&.Mui-focused": {
            border: (theme) => `1.2px solid ${theme.palette.neutral[100]}`,
            background: (theme) => theme.brand.white[100],
         },
      },
      "& .MuiInputBase-input": {
         ml: "8px",
         p: "0px",
         "&::placeholder": {
            color: (theme) => theme.palette.neutral[600],
            fontSize: {
               xs: "14px",
               sm: "14px",
               md: "16px",
            },
            fontWeight: "400",
         },
      },
      "& .MuiFilledInput-input": {
         color: (theme) => theme.palette.neutral[800],
         fontSize: {
            xs: "14px",
            sm: "14px",
            md: "16px",
         },
         fontWeight: "400",
      },
   },
   searchIcon: {
      color: (theme) => theme.palette.neutral[600],
      width: "24px",
      height: "24px",
   },
   clearIcon: {
      width: "24px",
      height: "24px",
      "&:hover": {
         cursor: "pointer",
      },
   },
})

export interface BrandedSearchBarProps {
   value: string
   onChange: (value: string) => void
   placeholder?: string
   fullWidth?: boolean
}

export const BrandedSearchBar = ({
   value,
   onChange,
   placeholder = "Search...",
   fullWidth = true,
}: BrandedSearchBarProps) => {
   return (
      <BrandedTextField
         fullWidth={fullWidth}
         placeholder={placeholder}
         sx={styles.searchField}
         InputProps={{
            startAdornment: <Box component={Search} sx={styles.searchIcon} />,
            endAdornment: value?.length ? (
               <Box
                  sx={styles.clearIcon}
                  component={XCircleIcon}
                  onClick={() => onChange("")}
               />
            ) : null,
         }}
         value={value}
         onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
         }
      />
   )
}

export default BrandedSearchBar
