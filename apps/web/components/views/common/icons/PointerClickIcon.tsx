import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/pointer-click.svg"

const PointerClickIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon
         component={ReactComponent}
         viewBox="0 0 16 16"
         sx={{
            "& path": {
               strokeWidth: 1,
            },
         }}
         {...props}
      />
   )
}

export default PointerClickIcon
