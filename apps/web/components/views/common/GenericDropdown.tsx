import {
   FormControl,
   InputLabel,
   MenuItem,
   Select,
   SelectChangeEvent,
} from "@mui/material"

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
   return (
      <FormControl fullWidth>
         <InputLabel id="demo-simple-select-label">{label}</InputLabel>
         <Select
            id={id}
            value={value}
            name={name}
            className={className}
            label={label}
            onChange={onChange}
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
