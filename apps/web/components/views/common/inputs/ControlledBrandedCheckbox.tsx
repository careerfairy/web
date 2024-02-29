import {
   Checkbox,
   FormControl,
   FormControlLabel,
   FormControlLabelProps,
   FormGroup,
   FormHelperText,
   useForkRef,
} from "@mui/material"
import { forwardRef } from "react"
import { Control, FieldPath, FieldValues, useController } from "react-hook-form"
import { combineStyles } from "types/commonTypes"
import { BrandedCheckboxProps } from "./BrandedCheckbox"

type ControlledBrandedCheckBoxProps<
   TFieldValues extends FieldValues = FieldValues,
   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
   name: TName
   control?: Control<TFieldValues>
   labelProps?: Omit<FormControlLabelProps, "label" | "control">
   label?: FormControlLabelProps["label"]
   helperText?: string
} & Omit<BrandedCheckboxProps, "name">

export const ControlledBrandedCheckBox = forwardRef<
   HTMLDivElement,
   ControlledBrandedCheckBoxProps
>(
   (
      {
         name,
         control,
         inputRef,
         required,
         labelProps,
         label,
         helperText,
         ...checkBoxprops
      },
      ref
   ) => {
      const {
         field: { onChange, ref: fieldRef, value },
         fieldState: { error },
      } = useController({
         name,
         control,
      })

      const handleInputRef = useForkRef(fieldRef, inputRef)

      return (
         <FormControl required={required} error={!!error} ref={ref}>
            <FormGroup row>
               <FormControlLabel
                  {...labelProps}
                  label={label || ""}
                  control={
                     <Checkbox
                        {...checkBoxprops}
                        color={checkBoxprops.color || "primary"}
                        sx={combineStyles(checkBoxprops.sx, {
                           color: error ? "error.main" : undefined,
                        })}
                        value={value}
                        checked={!!value}
                        onChange={onChange}
                        inputRef={handleInputRef}
                     />
                  }
               />
            </FormGroup>
            {Boolean(helperText) && (
               <FormHelperText error={!!error}>{helperText}</FormHelperText>
            )}
         </FormControl>
      )
   }
)

ControlledBrandedCheckBox.displayName = "BrandedCheckBoxController"
