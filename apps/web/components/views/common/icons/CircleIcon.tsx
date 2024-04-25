import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/circle.svg"

const CircleIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} viewBox="0 0 18 18" {...props} />
}

export default CircleIcon
