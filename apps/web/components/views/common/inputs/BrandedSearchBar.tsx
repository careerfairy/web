import { Box } from "@mui/material"
import { XCircleIcon } from "components/views/common/icons/XCircleIcon"
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react"
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

export interface BrandedSearchFieldProps {
   value: string
   onChange: (value: string) => void
   placeholder?: string
   fullWidth?: boolean
   name?: string
   autoComplete?: string
}

export const BrandedSearchField = ({
   value,
   onChange,
   placeholder = "Search...",
   fullWidth = true,
   name = "job-search",
   autoComplete = "on",
}: BrandedSearchFieldProps) => {
   const inputRef = useRef<HTMLInputElement>(null)
   const [showClearButton, setShowClearButton] = useState(!!value)

   // Sync external value changes to the input
   useEffect(() => {
      if (inputRef.current && inputRef.current.value !== value) {
         inputRef.current.value = value
         setShowClearButton(!!value)
      }
   }, [value])

   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
         const currentValue = inputRef.current?.value || ""
         onChange(currentValue)
      }
   }

   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      // Update clear button visibility based on current input value
      setShowClearButton(!!e.target.value)
   }

   const handleClear = () => {
      if (inputRef.current) {
         inputRef.current.value = ""
         inputRef.current.focus()
      }
      setShowClearButton(false)
      onChange("")
   }

   return (
      <BrandedTextField
         fullWidth={fullWidth}
         placeholder={placeholder}
         name={name}
         autoComplete={autoComplete}
         inputRef={inputRef}
         defaultValue={value}
         sx={styles.searchField}
         InputProps={{
            startAdornment: <Box component={Search} sx={styles.searchIcon} />,
            endAdornment: showClearButton ? (
               <Box
                  sx={styles.clearIcon}
                  component={XCircleIcon}
                  onClick={handleClear}
               />
            ) : null,
         }}
         onChange={handleChange}
         onKeyDown={handleKeyDown}
      />
   )
}

export default BrandedSearchField
