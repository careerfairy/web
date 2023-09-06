import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/icons/x-rounded-icon.svg"

const XRoundedIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} viewBox="0 0 49 48" {...props} />
}

export default XRoundedIcon
