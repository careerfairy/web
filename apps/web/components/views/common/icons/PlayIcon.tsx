import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

const PlayIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 75 75" {...props}>
         <path
            d="M37.5 68.75c17.259 0 31.25-13.991 31.25-31.25S54.759 6.25 37.5 6.25 6.25 20.241 6.25 37.5 20.241 68.75 37.5 68.75z"
            fill="#000"
            fillOpacity={0.25}
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M31.25 26.869a1 1 0 011.555-.832l15.947 10.63a1 1 0 010 1.665L32.805 48.964a1 1 0 01-1.555-.832V26.869z"
            fill="#fff"
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </SvgIcon>
   )
}

export default PlayIcon
