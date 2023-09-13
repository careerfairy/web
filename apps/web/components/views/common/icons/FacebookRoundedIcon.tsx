import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/icons/facebook-rounded-icon.svg"

const FacebookRoundedIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} viewBox="0 0 49 48" {...props} />
}

export default FacebookRoundedIcon
