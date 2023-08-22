import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/sparks/public-sparks-badge.svg"

const PublicSparksBadge = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} inheritViewBox {...props} />
}

export default PublicSparksBadge
