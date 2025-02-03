import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   datePicker: {
      width: "100%",
      "& .MuiOutlinedInput-root": {
         "& fieldset": {
            // default border
            borderColor: (theme) => theme.brand.purple[100],
         },
         "&:hover fieldset": {
            // hover border
            borderColor: (theme) => theme.brand.purple[200],
         },
         "&.Mui-focused fieldset": {
            // focused border (when clicked/opened)
            borderColor: "#EDE7FD",
         },
         "&.Mui-disabled fieldset": {
            borderColor: (theme) => theme.brand.purple[50],
         },
      },
      "& .MuiInputLabel-root": {
         "&.Mui-focused": {
            color: (theme) => theme.brand.purple[500],
         },
      },
   },
})

type Props = {
   fieldName: string
   label: string
   minDate?: Date
   disabled?: boolean
}

export const AcademicDatePicker = ({
   fieldName,
   label,
   minDate,
   disabled,
}: Props) => {
   const [isOpen, setIsOpen] = useState(false)

   const { setValue, getFieldState } = useFormContext()

   const fieldValue: Date = useWatch({
      name: fieldName,
   })

   const fieldState = getFieldState(fieldName)

   return (
      <DatePicker
         open={isOpen}
         onClose={() => setIsOpen(false)}
         slotProps={{
            textField: {
               onClick: () => setIsOpen(true),
               placeholder: label,
               error: Boolean(fieldState.error),
               helperText:
                  fieldState.error?.type == "typeError"
                     ? `${label} is required`
                     : undefined,
            },
            actionBar: {
               actions: ["clear"],
            },
         }}
         disableOpenPicker
         disabled={disabled}
         views={["month", "year"]}
         label={label}
         closeOnSelect
         value={fieldValue}
         onChange={(value) => {
            setValue(fieldName, value, { shouldValidate: true })
         }}
         sx={styles.datePicker}
         minDate={minDate}
      />
   )
}
