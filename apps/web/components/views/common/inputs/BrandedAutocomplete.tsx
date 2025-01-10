/* eslint-disable @typescript-eslint/no-explicit-any */
import {
   Autocomplete,
   AutocompleteProps,
   ListItemText,
   MenuItem,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { useField } from "formik"
import { FC, ReactElement } from "react"
import { BrandedCheckbox } from "./BrandedCheckbox"
import BrandedTextField, {
   BrandedTextFieldProps,
   FormBrandedTextField,
} from "./BrandedTextField"

type StyledBrandedAutocompleteProps<
   T extends { id: string; name: string } = any
> = Omit<AutocompleteProps<T, boolean, boolean, boolean>, "renderTags"> & {
   textFieldProps?: BrandedTextFieldProps
   limit?: number
   initialOptionSection?: ReactElement
   getOptionElement?: (option: unknown) => ReactElement
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
      initialOptionSection,
      getOptionElement,
      options,
      ...props
   }: StyledBrandedAutocompleteProps) => {
      const hasOptions = options.length > 0
      const newOptions = hasOptions ? options : [{ title: "INITIAL_SECTION" }]

      return (
         <Autocomplete
            getOptionDisabled={(optionEl) => {
               if (!props.multiple || !limit) return false
               return (
                  props.value?.length >= limit &&
                  !props.value?.find((item) => {
                     if (props.isOptionEqualToValue) {
                        return props.isOptionEqualToValue(item, optionEl)
                     }
                     return item === optionEl
                  })
               )
            }}
            options={newOptions}
            renderOption={(optionProps, option, { selected, index }) => (
               <>
                  {Boolean(index === 0 && initialOptionSection) &&
                     initialOptionSection}
                  {Boolean(hasOptions) && (
                     <MenuItem
                        {...optionProps}
                        key={JSON.stringify(option)}
                        sx={{
                           '&[aria-selected="true"]': {
                              backgroundColor: "#FAFAFA !important",
                           },
                        }}
                     >
                        {getOptionElement ? (
                           getOptionElement(option)
                        ) : (
                           <ListItemText
                              key={`${JSON.stringify(option)}-text`}
                              primary={getOptionLabel(option)}
                              sx={{ padding: "16px" }}
                           />
                        )}

                        {props.multiple ? (
                           <BrandedCheckbox checked={selected} />
                        ) : null}
                     </MenuItem>
                  )}
               </>
            )}
            {...props}
            color="primary"
            getOptionLabel={getOptionLabel}
            renderInput={renderInput}
         />
      )
   }
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

   const handleChange = async (...args) => {
      // If we follow TS validations we will be tied to props.onChange signature when we don't have to
      // @ts-ignore
      await props.onChange(...args)
      await onBlur({ target: { name } })
   }

   return (
      <StyledBrandedAutocomplete
         renderInput={(params) => (
            <FormBrandedTextField
               name={name}
               autocomplete
               {...params}
               {...textFieldProps}
            />
         )}
         {...props}
         onChange={handleChange}
      />
   )
}

export default BrandedAutocomplete
