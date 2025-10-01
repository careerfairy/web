import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/time-history.svg"

const TimeHistory = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} viewBox="0 0 20 20" {...props} />
}

export default TimeHistory
