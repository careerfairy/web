import {
   Autocomplete,
   AutocompleteProps,
   styled,
   TextFieldProps,
   useForkRef,
} from "@mui/material"
import CircularProgress from "@mui/material/CircularProgress"
import { forwardRef, ReactNode, Ref, RefAttributes } from "react"
import {
   Control,
   FieldError,
   FieldPath,
   FieldValues,
   useController,
   UseControllerProps,
} from "react-hook-form"
import { BrandedCheckbox } from "./BrandedCheckbox"
import BrandedTextField from "./BrandedTextField"

export type Option = {
   id: string | number
   value: string
}

export type AutocompleteElementProps<
   TValue extends Option | string | number,
   TFieldValues extends FieldValues = FieldValues,
   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
   Multiple extends boolean | undefined = boolean | undefined,
   DisableClearable extends boolean | undefined = boolean | undefined,
   FreeSolo extends boolean | undefined = boolean | undefined
> = {
   name: TName
   control?: Control<TFieldValues>
   options: TValue[]
   loading?: boolean
   multiple?: Multiple
   matchId?: boolean
   loadingIndicator?: ReactNode
   rules?: UseControllerProps<TFieldValues, TName>["rules"]
   parseError?: (error: FieldError) => ReactNode
   required?: boolean
   label?: TextFieldProps["label"]
   showCheckbox?: boolean
   autocompleteProps?: Omit<
      AutocompleteProps<TValue, Multiple, DisableClearable, FreeSolo>,
      "name" | "options" | "loading" | "renderInput"
   >
   textFieldProps?: Omit<TextFieldProps, "name" | "required" | "label"> & {
      requiredText: string
   }
   limit?: number
}

type AutocompleteElementComponent = <
   TValue extends Option | string | number,
   TFieldValues extends FieldValues = FieldValues,
   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
   props: AutocompleteElementProps<
      TValue,
      TFieldValues,
      TName,
      boolean | undefined,
      boolean | undefined,
      boolean | undefined
   > &
      RefAttributes<HTMLDivElement>
) => JSX.Element

const StyledMenuItem = styled("li")(({ theme }) => ({
   justifyContent: "space-between !important",

   '&[aria-selected="true"]': {
      backgroundColor: `${theme.brand.black[100]} !important`,
   },
}))

export const ControlledBrandedAutoComplete = forwardRef(
   function AutocompleteElement<
      TValue extends Option | string | number,
      TFieldValues extends FieldValues = FieldValues,
      TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
   >(
      props: AutocompleteElementProps<
         TValue,
         TFieldValues,
         TName,
         boolean | undefined,
         boolean | undefined,
         boolean | undefined
      >,
      ref: Ref<HTMLDivElement>
   ) {
      const {
         textFieldProps,
         autocompleteProps,
         name,
         control,
         options,
         loading,
         showCheckbox,
         rules,
         loadingIndicator,
         required,
         multiple,
         matchId,
         label,
         limit,
      } = props

      const loadingElement = loadingIndicator || (
         <CircularProgress color="inherit" size={20} />
      )

      const {
         field,
         fieldState: { error },
      } = useController({
         name,
         control,
      })

      const handleInputRef = useForkRef(field.ref, textFieldProps?.inputRef)

      let currentValue = multiple ? field.value || [] : field.value ?? null

      if (matchId) {
         // This block ensures that the current value matches an option's id or the option itself,
         // facilitating the use of objects with an 'id' property or direct values as options.
         // @ts-ignore
         currentValue = multiple
            ? (field.value || [])
                 .map(
                    (i) =>
                       options.find((j) => {
                          // @ts-ignore
                          return (j.id ?? j) === i
                       }) ?? null
                 )
                 .filter(Boolean)
            : options.find((i) => {
                 // @ts-ignore
                 return (i.id ?? i) === field.value
              }) ?? null
      }

      return (
         <Autocomplete
            {...autocompleteProps}
            value={currentValue}
            loading={loading}
            multiple={multiple}
            options={options}
            getOptionDisabled={(option) => {
               if (!props.multiple || !limit) return false

               if (
                  currentValue.findIndex((value) => value.id === option.id) >= 0
               ) {
                  return false
               }
               return currentValue.length >= limit
            }}
            disableCloseOnSelect={
               typeof autocompleteProps?.disableCloseOnSelect === "boolean"
                  ? autocompleteProps.disableCloseOnSelect
                  : !!multiple
            }
            isOptionEqualToValue={
               autocompleteProps?.isOptionEqualToValue
                  ? autocompleteProps.isOptionEqualToValue
                  : (option, value) => {
                       return value ? option.id === (value?.id ?? value) : false
                    }
            }
            getOptionLabel={
               autocompleteProps?.getOptionLabel
                  ? autocompleteProps.getOptionLabel
                  : (option) => {
                       return `${option?.value ?? option}`
                    }
            }
            onChange={(event, value, reason, details) => {
               let changedVal = value
               if (matchId) {
                  changedVal = Array.isArray(value)
                     ? value.map((i: Option) => i?.id ?? i)
                     : value?.id ?? value
               }
               field.onChange(changedVal)
               if (autocompleteProps?.onChange) {
                  autocompleteProps.onChange(event, value, reason, details)
               }
            }}
            ref={ref}
            renderOption={
               autocompleteProps?.renderOption ??
               ((props, option, { selected }) => (
                  <StyledMenuItem {...props} key={option?.id || option}>
                     {autocompleteProps?.getOptionLabel?.(option) ||
                        option.value ||
                        option}

                     {showCheckbox ? (
                        <BrandedCheckbox checked={selected} />
                     ) : null}
                  </StyledMenuItem>
               ))
            }
            onBlur={(event) => {
               field.onBlur()
               if (typeof autocompleteProps?.onBlur === "function") {
                  autocompleteProps.onBlur(event)
               }
            }}
            renderInput={(params) => (
               <BrandedTextField
                  name={name}
                  required={rules?.required ? true : required}
                  label={label}
                  {...textFieldProps}
                  {...params}
                  error={!!error}
                  InputLabelProps={{
                     ...params.InputLabelProps,
                     ...textFieldProps?.InputLabelProps,
                  }}
                  InputProps={{
                     ...params.InputProps,
                     endAdornment: (
                        <>
                           {loading ? loadingElement : null}
                           {params.InputProps.endAdornment}
                        </>
                     ),
                     ...textFieldProps?.InputProps,
                  }}
                  inputProps={{
                     ...params.inputProps,
                     ...textFieldProps?.inputProps,
                  }}
                  helperText={
                     error ? error.message : textFieldProps?.helperText
                  }
                  inputRef={handleInputRef}
               />
            )}
            data-testid={name + "-autocomplete"}
         />
      )
   }
) as AutocompleteElementComponent
