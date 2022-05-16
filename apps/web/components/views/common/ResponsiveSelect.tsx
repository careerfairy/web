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
import Box from "@mui/material/Box"

export const ResponsiveSelect = ({
   displayEmpty,
   labelId,
   ...props
}: Partial<SelectProps> | Partial<NativeSelectProps> | any) => {
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("sm"))

   return mobile ? (
      <NativeSelect {...props} />
   ) : (
      <Select labelId={labelId} displayEmpty={displayEmpty} {...props} />
   )
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
   return mobile ? (
      <option {...props} />
   ) : (
      <MenuItem {...props}>
         {props.icon && <Box sx={{ mr: 1 }}>{props.icon}</Box>}
         {props.children}
      </MenuItem>
   )
}
