import { Autocomplete, AutocompleteProps } from "@mui/material"
import { styled } from "@mui/material/styles"
import BrandedTextField, { BrandedTextFieldProps } from "./BrandedTextField"

import { ListItemText, MenuItem } from "@mui/material"
import BrandedCheckbox from "./BrandedCheckbox"
import BrandedRadio from "./BrandedRadio"

type BrandedAutocompleteProps<T extends { id: string; name: string } = any> =
   Omit<
      AutocompleteProps<T, boolean, boolean, boolean>,
      "renderInput" | "renderTags"
   > & {
      textFieldProps?: BrandedTextFieldProps
      limit?: number
   }

const BrandedAutocomplete = styled(
   ({
      limit,
      textFieldProps,
      getOptionLabel,
      ...props
   }: BrandedAutocompleteProps) => (
      <Autocomplete
         getOptionDisabled={(optionEl) => {
            if (!props.multiple || !limit) return false
            return (
               props.value.length >= limit &&
               !props.value.find((item) => {
                  if (props.isOptionEqualToValue) {
                     return props.isOptionEqualToValue(item, optionEl)
                  }
                  return item === optionEl
               })
            )
         }}
         {...props}
         renderOption={(optionProps, option, { selected }) => (
            <MenuItem
               {...optionProps}
               key={option.id}
               sx={{
                  '&[aria-selected="true"]': {
                     backgroundColor: "white !important",
                  },
               }}
            >
               <ListItemText primary={getOptionLabel(option)} />
               {props.multiple ? (
                  <BrandedCheckbox checked={selected} />
               ) : (
                  <BrandedRadio checked={selected} />
               )}
            </MenuItem>
         )}
         color="primary"
         getOptionLabel={getOptionLabel}
         renderInput={(params) => (
            <BrandedTextField {...params} {...textFieldProps} />
         )}
      />
   )
)({})

export default BrandedAutocomplete
