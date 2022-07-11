import {
   FormControl,
   InputLabel,
   MenuItem,
   Select,
   SelectChangeEvent,
} from "@mui/material"
import { useState } from "react"

export type DropdownItem = {
   id: string
   value: string
   label: string
}

type Props = {
   id: string
   name: string
   onChange: (e: SelectChangeEvent) => void
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
}: Props) => {
   const [isOpen, setIsOpen] = useState(false)

   const handleChange = (event) => {
      event.preventDefault()
      setIsOpen(false)
      onChange(event)
   }
   return (
      <FormControl fullWidth>
         <InputLabel id="generic-dropdown-label">{label}</InputLabel>
         <Select
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            onClick={() => setIsOpen(false)}
            id={id}
            value={value}
            name={name}
            className={className}
            label={label}
            onChange={handleChange}
            MenuProps={{
               hideBackdrop: true,
            }}
         >
            {list.map(({ id, value, label }) => (
               <MenuItem key={id} id={id} value={value}>
                  {label}
               </MenuItem>
            ))}
         </Select>
      </FormControl>
   )
}
export default GenericDropdown
