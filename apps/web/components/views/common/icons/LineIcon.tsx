import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/icons/line-icon.svg"

export const LineIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} viewBox="0 0 95 4" {...props} />
}
