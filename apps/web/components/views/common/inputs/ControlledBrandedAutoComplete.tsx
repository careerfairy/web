import {
   Control,
   FieldError,
   FieldPath,
   FieldValues,
   useController,
   UseControllerProps,
} from "react-hook-form"
import {
   Autocomplete,
   AutocompleteProps,
   Checkbox,
   TextFieldProps,
   useForkRef,
} from "@mui/material"
import CircularProgress from "@mui/material/CircularProgress"
import { forwardRef, ReactNode, Ref, RefAttributes } from "react"
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
   textFieldProps?: Omit<TextFieldProps, "name" | "required" | "label">
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
         // @ts-ignore
         currentValue = multiple
            ? (field.value || []).map(
                 (i) =>
                    options.find((j) => {
                       // @ts-ignore
                       return (j.id ?? j) === i
                    }) ?? {}
              )
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
               (showCheckbox
                  ? (props, option, { selected }) => (
                       <li {...props}>
                          <Checkbox
                             sx={{ marginRight: 1 }}
                             checked={selected}
                          />
                          {autocompleteProps?.getOptionLabel?.(option) ||
                             option.value ||
                             option}
                       </li>
                    )
                  : (props, option) => (
                       <li {...props} key={option?.id || option}>
                          {autocompleteProps?.getOptionLabel?.(option) ||
                             option.value ||
                             option}
                       </li>
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
         />
      )
   }
) as AutocompleteElementComponent
