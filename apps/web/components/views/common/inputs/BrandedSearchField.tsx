import {
   Box,
   IconButton,
   List,
   ListItem,
   ListItemText,
   Paper,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { XCircleIcon } from "components/views/common/icons/XCircleIcon"
import React, { ChangeEvent, useRef, useState } from "react"
import { Search, X } from "react-feather"
import { useClickAway } from "react-use"
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
            opacity: 1,
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
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   optionIcon: {
      width: "16px",
      height: "16px",
   },
   clearIcon: {
      width: "24px",
      height: "24px",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": {
         cursor: "pointer",
      },
   },
   dropdownContainer: {
      position: "relative",
      width: "100%",
   },
   dropdown: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      mt: 1,
      maxHeight: "500px",
      overflow: "auto",
      borderRadius: "8px",
      boxShadow: "0px 0px 12px 0px rgba(20, 20, 20, 0.08)",
      zIndex: (theme) => theme.zIndex.appBar - 1,
   },
   optionItem: {
      color: (theme) => theme.palette.neutral[700],
      px: { xs: 0, md: 1.5 },
      py: 1,
      cursor: "pointer",
      position: "relative",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.neutral[50],
      },
      "&.selected": {
         backgroundColor: (theme) => theme.palette.neutral[100],
      },
   },
   deleteButton: {
      color: (theme) => theme.palette.neutral[200],
      width: "24px",
      height: "24px",
      padding: "4px",
      "&:hover": {
         color: (theme) => theme.palette.neutral[600],
         backgroundColor: (theme) => theme.palette.neutral[100],
      },
   },
})

export interface BrandedSearchFieldInputProps {
   value: string
   onChange: (value: string) => void
   placeholder?: string
   fullWidth?: boolean
   onKeyDown?: (e: React.KeyboardEvent) => void
   showStartIcon?: boolean
   onFocus?: () => void
   onBlur?: () => void
   onClear?: () => void
   autoFocus?: boolean
   "aria-expanded"?: boolean
   "aria-controls"?: string
}

const Input = ({
   value,
   onChange,
   placeholder = "Search...",
   fullWidth = true,
   onKeyDown,
   showStartIcon = true,
   onFocus,
   onBlur,
   onClear,
   autoFocus = false,
   "aria-expanded": ariaExpanded,
   "aria-controls": ariaControls,
}: BrandedSearchFieldInputProps) => {
   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange(newValue)
   }

   const handleClear = () => {
      onChange("")
      onClear?.()
   }

   return (
      <BrandedTextField
         id={"search-field-input"}
         fullWidth={fullWidth}
         placeholder={placeholder}
         sx={styles.searchField}
         autoFocus={autoFocus}
         InputProps={{
            startAdornment: showStartIcon ? (
               <Box component={Search} sx={styles.searchIcon} />
            ) : null,
            endAdornment: value?.length ? (
               <Box
                  sx={styles.clearIcon}
                  component={XCircleIcon}
                  onClick={handleClear}
               />
            ) : null,
         }}
         inputProps={{
            "aria-expanded": ariaExpanded,
            "aria-controls": ariaControls,
            "aria-autocomplete": "list",
            role: "combobox",
         }}
         value={value}
         onChange={handleInputChange}
         onKeyDown={onKeyDown}
         onFocus={onFocus}
         onBlur={onBlur}
      />
   )
}

export interface DropdownRenderProps {
   close: () => void
}

export interface BrandedSearchFieldDropdownProps {
   children?:
      | React.ReactNode
      | ((props: DropdownRenderProps) => React.ReactNode)
   isOpen: boolean
   handleClose: () => void
}

const Dropdown = ({
   isOpen,
   handleClose,
   children,
}: BrandedSearchFieldDropdownProps) => {
   const dropdownRef = useRef<HTMLDivElement>(null)

   useClickAway(dropdownRef, () => {
      if (isOpen) {
         handleClose()
      }
   })

   if (!isOpen) return null

   const renderProps: DropdownRenderProps = {
      close: handleClose,
   }

   return (
      <Paper
         ref={dropdownRef}
         sx={styles.dropdown}
         id={"search-field-dropdown"}
         role="listbox"
         aria-labelledby={"search-field-input"}
      >
         {typeof children === "function" ? children(renderProps) : children}
      </Paper>
   )
}

export interface DropdownListProps {
   onSelect: (option: string) => void
   options: string[]
   startIcon?: React.ElementType
   onDelete?: (option: string) => void
   showDeleteButtons?: boolean
}

const DropdownList = ({
   onSelect,
   options,
   startIcon = Search,
   onDelete,
}: DropdownListProps) => {
   const isMobile = useIsMobile()

   const handleOptionClick = (option: string) => {
      onSelect(option)
   }

   const handleDelete = (e: React.MouseEvent, option: string) => {
      e.stopPropagation()
      onDelete?.(option)
   }

   return (
      <List dense>
         {options.map((option, index) => {
            return (
               <ListItem
                  key={`${option}-${index}`}
                  sx={styles.optionItem}
                  onClick={() => handleOptionClick(option)}
                  secondaryAction={
                     onDelete ? (
                        <IconButton
                           sx={styles.deleteButton}
                           onClick={(e) => handleDelete(e, option)}
                        >
                           <X size={16} />
                        </IconButton>
                     ) : null
                  }
               >
                  <Box
                     component={startIcon}
                     sx={[styles.optionIcon, { mr: isMobile ? 1.5 : 1 }]}
                  />
                  <ListItemText
                     primary={option}
                     primaryTypographyProps={{
                        fontSize: "16px",
                        fontWeight: "400",
                     }}
                  />
               </ListItem>
            )
         })}
      </List>
   )
}

export interface BrandedSearchFieldProps {
   value: string
   onChange: (value: string) => void
   placeholder?: string
   fullWidth?: boolean
   onKeyDown?: (e: React.KeyboardEvent) => void
   showStartIcon?: boolean
   onFocus?: () => void
   onBlur?: () => void
   children?:
      | React.ReactNode
      | ((props: DropdownRenderProps) => React.ReactNode)
   enableDropdown?: boolean
   autoFocus?: boolean
}

export const BrandedSearchField = ({
   value,
   onChange,
   placeholder = "Search...",
   fullWidth = true,
   onKeyDown,
   showStartIcon = true,
   onFocus,
   onBlur,
   children,
   enableDropdown = false,
   autoFocus = false,
}: BrandedSearchFieldProps) => {
   const [isDropdownOpen, setIsDropdownOpen] = useState(false)

   const handleInputChange = (newValue: string) => {
      onChange(newValue)
      if (enableDropdown) {
         setIsDropdownOpen(true)
      }
   }

   const handleClear = () => {
      setIsDropdownOpen(false)
   }

   const handleFocus = () => {
      if (enableDropdown) {
         setIsDropdownOpen(true)
      }
      onFocus?.()
   }

   const handleBlur = () => {
      onBlur?.()
   }

   const handleDropdownClose = () => {
      setIsDropdownOpen(false)
   }

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && isDropdownOpen) {
         setIsDropdownOpen(false)
         e.preventDefault()
      }
      if (e.key === "Enter") {
         setIsDropdownOpen((prev) => !prev)
         e.preventDefault()
      }

      onKeyDown?.(e)
   }

   return (
      <Box sx={styles.dropdownContainer}>
         <Input
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            fullWidth={fullWidth}
            onKeyDown={handleKeyDown}
            showStartIcon={showStartIcon}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClear={handleClear}
            autoFocus={autoFocus}
            aria-expanded={isDropdownOpen}
            aria-controls={"search-field-dropdown"}
         />
         {Boolean(enableDropdown) && (
            <Dropdown isOpen={isDropdownOpen} handleClose={handleDropdownClose}>
               {children}
            </Dropdown>
         )}
      </Box>
   )
}

BrandedSearchField.Input = Input
BrandedSearchField.DropdownList = DropdownList
