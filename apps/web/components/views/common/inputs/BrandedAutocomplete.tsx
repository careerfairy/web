/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, ReactElement } from "react"
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
      // If an {initialOptionSection} exists, add an extra option at the beginning of the list
      const newOptions = initialOptionSection
         ? [{ title: "INITIAL_SECTION" }, ...options]
         : options

      return (
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
            options={newOptions}
            {...props}
            renderOption={(optionProps, option, { selected, index }) => (
               <>
                  {index === 0 && initialOptionSection ? (
                     initialOptionSection
                  ) : (
                     <MenuItem
                        {...optionProps}
                        key={optionProps.id}
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
                              key={`${optionProps.id}-text`}
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
