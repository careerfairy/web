/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react"
import { styled } from "@mui/material/styles"
import BrandedCheckbox from "./BrandedCheckbox"
import { ListItemText, MenuItem } from "@mui/material"
import { Autocomplete, AutocompleteProps } from "@mui/material"
import BrandedTextField, {
   BrandedTextFieldProps,
   FormBrandedTextField,
} from "./BrandedTextField"
import { useField } from "formik"

type StyledBrandedAutocompleteProps<
   T extends { id: string; name: string } = any
> = Omit<AutocompleteProps<T, boolean, boolean, boolean>, "renderTags"> & {
   textFieldProps?: BrandedTextFieldProps
   limit?: number
}

export type BrandedAutocompleteProps = Omit<
   StyledBrandedAutocompleteProps,
   "renderInput"
>

type FormBrandedAutocompleteProps = BrandedAutocompleteProps & { name: string }

const StyledBrandedAutocomplete = styled(
   ({
      limit,
      getOptionLabel,
      renderInput,
      ...props
   }: StyledBrandedAutocompleteProps) => (
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
                     backgroundColor: "#FAFAFA !important",
                  },
               }}
            >
               <ListItemText
                  key={`${option.id}-text`}
                  primary={getOptionLabel(option)}
                  sx={{ padding: "16px" }}
               />
               {props.multiple ? <BrandedCheckbox checked={selected} /> : null}
            </MenuItem>
         )}
         color="primary"
         getOptionLabel={getOptionLabel}
         renderInput={renderInput}
      />
   )
)({})

const BrandedAutocomplete: FC<BrandedAutocompleteProps> = ({
   textFieldProps,
   ...props
}) => {
   return (
      <StyledBrandedAutocomplete
         {...props}
         renderInput={(params) => (
            <BrandedTextField {...params} {...textFieldProps} />
         )}
      />
   )
}

export const FormBrandedAutocomplete: FC<FormBrandedAutocompleteProps> = ({
   name,
   textFieldProps,
   ...props
}) => {
   const [{ onBlur }, ,] = useField(name)
   return (
      <StyledBrandedAutocomplete
         renderInput={(params) => (
            <FormBrandedTextField name={name} {...params} {...textFieldProps} />
         )}
         {...props}
         onChange={async (...args) => {
            await props.onChange(...args)
            await onBlur({ target: { name } })
         }}
      />
   )
}

export default BrandedAutocomplete
