import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/sparks/likes-icon.svg"

const LikesIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} inheritViewBox {...props} />
}

export default LikesIcon
