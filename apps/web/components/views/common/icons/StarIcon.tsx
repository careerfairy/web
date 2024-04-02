import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/star-full.png"

const StarIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} viewBox="0 0 14 12" {...props} />
}

export default StarIcon
