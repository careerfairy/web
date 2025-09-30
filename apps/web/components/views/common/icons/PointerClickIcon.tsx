import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/pointer-click.svg"

const PointerClickIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} viewBox="0 0 18 18" {...props} />
}

export default PointerClickIcon
