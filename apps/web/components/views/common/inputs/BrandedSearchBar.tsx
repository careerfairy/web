import { Box } from "@mui/material"
import { XCircleIcon } from "components/views/common/icons/XCircleIcon"
import { ChangeEvent, KeyboardEvent } from "react"
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

export type SearchSettings = {
   submitOnEnter?: boolean
   onSubmit?: (value: string) => void
   submitOnBlur?: boolean
}

export interface BrandedSearchFieldProps {
   value: string
   onChange: (value: string) => void
   placeholder?: string
   fullWidth?: boolean
   settings?: SearchSettings
}

export const BrandedSearchField = ({
   value,
   onChange,
   placeholder = "Search...",
   fullWidth = true,
   settings,
}: BrandedSearchFieldProps) => {
   const {
      submitOnEnter = false,
      onSubmit,
      submitOnBlur = false,
   } = settings || {}

   const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (submitOnEnter && event.key === "Enter" && onSubmit) {
         event.preventDefault()
         onSubmit(value)
      }
   }

   const handleBlur = () => submitOnBlur && onSubmit?.(value)

   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
   }

   const handleClear = () => {
      onChange("")
      onSubmit?.("")
   }

   return (
      <BrandedTextField
         fullWidth={fullWidth}
         placeholder={placeholder}
         sx={styles.searchField}
         InputProps={{
            startAdornment: (
               <Box sx={styles.searchIcon}>
                  <Search />
               </Box>
            ),
            endAdornment: value?.length ? (
               <Box
                  sx={styles.clearIcon}
                  component={XCircleIcon}
                  onClick={handleClear}
               />
            ) : null,
         }}
         value={value}
         onChange={handleChange}
         onKeyDown={handleKeyDown}
         onBlur={handleBlur}
      />
   )
}

export default BrandedSearchField
