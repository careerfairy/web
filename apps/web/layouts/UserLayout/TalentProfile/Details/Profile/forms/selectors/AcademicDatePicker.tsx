import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   datePicker: {
      width: "100%",
      "& .MuiOutlinedInput-root": {
         "& fieldset": {
            borderRadius: "8px",
            border: (theme) => `1px solid ${theme.brand.purple[100]}`,
         },
         "&:hover fieldset": {
            borderRadius: "8px",
            border: (theme) => `1px solid ${theme.brand.purple[200]}`,
            backgroundColor: (theme) => theme.brand.white[400],
         },
         "&.Mui-focused fieldset": {
            // focused border (when clicked/opened)
            borderRadius: "8px",
            border: (theme) => `1px solid ${theme.brand.purple[300]}`,
            backgroundColor: (theme) => theme.brand.white[300],
         },
      },
      ".Mui-disabled": {
         borderColor: (theme) => theme.brand.purple[50],
         backgroundColor: "#F7F8FC",
         opacity: 0.5,
         "&:hover": {
            backgroundColor: "#F7F8FC",
            borderColor: (theme) => `${theme.brand.purple[50]} !important`,
         },
         cursor: "not-allowed",
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
         slots={{
            textField: BrandedTextField,
         }}
         slotProps={{
            textField: {
               onClick: disabled ? undefined : () => setIsOpen(true),
               error: Boolean(fieldState.error),
               helperText:
                  fieldState.error?.type == "typeError"
                     ? `${label} is required`
                     : undefined,
               label: label,
            },
            actionBar: {
               actions: ["clear"],
            },
         }}
         format="MMMM, yyyy"
         disableOpenPicker
         disabled={disabled}
         views={["year", "month"]}
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
