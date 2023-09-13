import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/icons/linkedin-rounded-icon.svg"

const LinkedInRoundedIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} viewBox="0 0 49 48" {...props} />
}

export default LinkedInRoundedIcon
