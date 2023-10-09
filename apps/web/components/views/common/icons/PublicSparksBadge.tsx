import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/sparks/public-sparks-badge.svg"
import { shouldEnableSParksB2C } from "util/CommonUtil"

const PublicSparksBadge = (props: SvgIconProps) => {
   if (!shouldEnableSParksB2C()) return null // TODO: remove this when sparks is enabled for B2C
   return <SvgIcon component={ReactComponent} inheritViewBox {...props} />
}

export default PublicSparksBadge
