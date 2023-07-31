import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/sparks/impressions-icon.svg"

const ImpressionsIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} inheritViewBox {...props} />
}

export default ImpressionsIcon
