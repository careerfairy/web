import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const StopIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 32 32" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
         >
            <path d="M8 8H24V24H8V8Z" fill="currentColor" />
         </svg>
      </SvgIcon>
   )
}
