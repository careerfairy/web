import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/sparks/share-icon.svg"

const ShareIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} inheritViewBox {...props} />
}

export default ShareIcon
