import { useForkRef } from "@mui/material"
import BrandedTextField, { BrandedTextFieldProps } from "./BrandedTextField"
import { Control, FieldPath, FieldValues, useController } from "react-hook-form"
import { forwardRef } from "react"

type ControlledBrandedTextFieldProps<
   TFieldValues extends FieldValues = FieldValues,
   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
   name: TName
   /**
    * Must pass control prop if not using FormProvider
    */
   control?: Control<TFieldValues>
} & BrandedTextFieldProps

export const ControlledBrandedTextField = forwardRef<
   HTMLDivElement,
   ControlledBrandedTextFieldProps
>(({ name, control, inputRef, required, ...textFieldprops }, ref) => {
   const {
      field: { name: fieldName, onBlur, onChange, ref: fieldRef, value },
      fieldState: { error, isTouched },
   } = useController({
      name,
      control,
   })

   const handleInputRef = useForkRef(fieldRef, inputRef)

   return (
      <BrandedTextField
         {...textFieldprops}
         name={fieldName}
         value={value}
         onChange={onChange}
         onBlur={onBlur}
         required={required}
         error={Boolean(error)}
         helperText={
            error ? isTouched && error.message : textFieldprops.helperText
         }
         ref={ref}
         inputRef={handleInputRef}
      />
   )
})

ControlledBrandedTextField.displayName = "BrandedTextFieldController"
