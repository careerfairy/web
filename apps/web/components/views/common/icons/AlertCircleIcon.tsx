import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

const AlertCircleIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 76 76" {...props}>
         <svg
            width="176"
            height="176"
            viewBox="0 0 76 76"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <g id="alert-circle">
               <path
                  id="Vector"
                  d="M37.9997 69.6667C55.4887 69.6667 69.6663 55.489 69.6663 38C69.6663 20.511 55.4887 6.33333 37.9997 6.33333C20.5107 6.33333 6.33301 20.511 6.33301 38C6.33301 55.489 20.5107 69.6667 37.9997 69.6667Z"
                  stroke="#FF1616"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
               />
               <path
                  id="Vector_2"
                  d="M38 25.3333V38"
                  stroke="#FF1616"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
               />
               <path
                  id="Vector_3"
                  d="M38 50.6667H38.0317"
                  stroke="#FF1616"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
               />
            </g>
         </svg>
      </SvgIcon>
   )
}

export default AlertCircleIcon
