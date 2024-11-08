import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   datePicker: {
      minWidth: {
         md: "230px",
         sm: "auto",
         xs: "auto",
      },
   },
})

type Props = {
   fieldName: string
   label: string
}

export const AcademicDatePicker = ({ fieldName, label }: Props) => {
   const [isOpen, setIsOpen] = useState(false)

   const { setValue } = useFormContext()

   const fieldValue = useWatch({
      name: fieldName,
   })

   return (
      <DatePicker
         open={isOpen}
         onClose={() => setIsOpen(false)}
         slotProps={{
            textField: {
               onClick: () => setIsOpen(true),
               placeholder: label,
            },
            actionBar: {
               actions: ["clear"],
            },
         }}
         disableOpenPicker
         views={["month", "year"]}
         value={fieldValue}
         onChange={(value) => {
            setValue(fieldName, value)
         }}
         sx={styles.datePicker}
      />
   )
}
