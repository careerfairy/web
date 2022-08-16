import { MenuItem, OutlinedTextFieldProps, TextField } from "@mui/material"
import { ChangeEvent } from "react"
import useIsMobile from "../../custom-hook/useIsMobile"

export type DropdownItem = {
   id: string
   value: string
   label: string
}

interface Props extends Omit<OutlinedTextFieldProps, "variant"> {
   id: string
   name: string
   value: string
   label: string
   list: DropdownItem[]
   className?: string
}

const GenericDropdown = ({
   id,
   name,
   className = "",
   onChange,
   value,
   label,
   list,
   ...rest
}: Props) => {
   const isMobile = useIsMobile()
   const handleChange = (
      event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
   ) => {
      event.preventDefault()
      onChange(event)
   }

   return (
      <TextField
         select
         id={id}
         value={value}
         name={name}
         label={label}
         onChange={handleChange}
         fullWidth
         SelectProps={{
            native: isMobile,
            MenuProps: {
               hideBackdrop: true,
            },
            className,
         }}
         {...rest}
      >
         {list.map(({ id, value, label }) =>
            isMobile ? (
               <option key={id} id={id} value={value}>
                  {label}
               </option>
            ) : (
               <MenuItem key={id} id={id} value={value}>
                  {label}
               </MenuItem>
            )
         )}
      </TextField>
   )
}
export default GenericDropdown
