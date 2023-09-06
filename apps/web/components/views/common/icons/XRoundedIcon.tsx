import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/icons/x-rounded-icon.svg"

const XRoundedIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon
         component={ReactComponent}
         viewBox="0 0 962.7 962.7"
         style={styles}
         {...props}
      />
   )
}

const styles = {
   color: "black",
}

export default XRoundedIcon
