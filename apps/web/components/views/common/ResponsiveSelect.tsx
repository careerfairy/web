import { useTheme } from "@mui/material/styles"
import {
   MenuItem,
   MenuItemProps,
   NativeSelect,
   NativeSelectProps,
   Select,
   SelectProps,
   useMediaQuery,
} from "@mui/material"

export const ResponsiveSelect = (
   props: Partial<SelectProps> | Partial<NativeSelectProps> | any
) => {
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("sm"))

   return mobile ? <NativeSelect {...props} /> : <Select {...props} />
}

export const ResponsiveOption = (
   props: MenuItemProps | HTMLOptionElement | any
) => {
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("sm"))
   if (mobile && props.value === "")
      return (
         <option value="" {...props}>
            Select an option
         </option>
      )
   return mobile ? <option {...props} /> : <MenuItem {...props} />
}
