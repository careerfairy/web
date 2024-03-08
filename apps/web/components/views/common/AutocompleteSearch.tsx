import React, { FC, useCallback, useMemo } from "react"
import Autocomplete, {
   AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete"
import { InputAdornment } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import { StyledTextField } from "../group/admin/common/inputs"
import { COPY_CONSTANTS } from "@careerfairy/shared-lib/constants"

const styles = sxStyles({
   listBox: {
      "& li": {
         backgroundColor: "transparent",
         "&:hover": {
            backgroundColor: (theme) =>
               theme.palette.action.hover + " !important",
         },
      },
   },
})

type AutocompleteSearchProps<TOption = unknown> = {
   id: string
   value?: TOption
   handleChange: (value: TOption | null) => void
   options: TOption[]
   renderOption: (
      props: React.HTMLAttributes<HTMLLIElement>,
      option: TOption,
      state: AutocompleteRenderOptionState
   ) => JSX.Element
   isOptionEqualToValue: (option: TOption, value: TOption) => boolean
   getOptionLabel: (option: TOption) => string
   setInputValue: React.Dispatch<React.SetStateAction<string>>
   inputValue: string
   loading?: boolean
   inputStartIcon?: React.ReactNode
   inputEndIcon?: React.ReactNode
   noOptionsText?: string
   placeholderText?: string
   minCharacters?: number
   disableFiltering?: boolean
   open?: boolean
   setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

const AutocompleteSearch: FC<AutocompleteSearchProps> = <T,>({
   id,
   value,
   handleChange,
   options,
   renderOption,
   getOptionLabel,
   isOptionEqualToValue,
   setInputValue,
   noOptionsText = "No options found",
   placeholderText = "Search",
   minCharacters,
   inputValue,
   inputStartIcon,
   inputEndIcon,
   loading,
   disableFiltering,
   open,
   setOpen,
}) => {
   const inputTooSmall = minCharacters && inputValue.length < minCharacters

   const searchOptions = useMemo<T[]>(() => {
      if (inputTooSmall) {
         return []
      }
      return options
   }, [inputTooSmall, options])

   const onChange = useCallback(
      (event, newValue: T | null) => {
         return handleChange(newValue)
      },
      [handleChange]
   )

   const onInputChange = useCallback(
      (event, newInputValue: string, reason) => {
         if (reason === "reset") {
            setInputValue("") // reset input value when user clicks on clear button/esacpe/outside
            return
         }
         setInputValue(newInputValue)
      },
      [setInputValue]
   )

   return (
      <Autocomplete
         id={id}
         fullWidth
         open={open}
         onOpen={setOpen ? () => setOpen(true) : undefined}
         onClose={setOpen ? () => setOpen(false) : undefined}
         loading={loading}
         getOptionLabel={getOptionLabel}
         options={searchOptions}
         autoComplete
         disableClearable
         forcePopupIcon={inputTooSmall ? false : undefined}
         blurOnSelect
         includeInputInList
         clearOnBlur
         ListboxProps={listBoxProps}
         value={value}
         isOptionEqualToValue={isOptionEqualToValue}
         noOptionsText={
            inputTooSmall
               ? COPY_CONSTANTS.FORMS.MIN_SEARCH_CHARACTERS
               : noOptionsText
         }
         onChange={onChange}
         onInputChange={onInputChange}
         renderInput={(params) => (
            <StyledTextField
               {...params}
               InputProps={{
                  ...params.InputProps,
                  ...(inputStartIcon && {
                     startAdornment: (
                        <InputAdornment position="start">
                           {inputStartIcon}
                        </InputAdornment>
                     ),
                  }),
                  ...(inputEndIcon && {
                     endAdornment: (
                        <InputAdornment position="end">
                           {inputEndIcon}
                        </InputAdornment>
                     ),
                  }),
               }}
               placeholder={placeholderText}
               fullWidth
            />
         )}
         renderOption={renderOption}
         filterOptions={disableFiltering ? (x) => x : undefined}
      />
   )
}

const listBoxProps: React.ComponentProps<typeof Autocomplete>["ListboxProps"] =
   {
      // @ts-ignore
      sx: styles.listBox,
   }
export default AutocompleteSearch
