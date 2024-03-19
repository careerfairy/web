import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const StopStreamIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 64 64" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
         >
            <path
               d="M31.9997 58.6667C46.7273 58.6667 58.6663 46.7276 58.6663 32C58.6663 17.2724 46.7273 5.33337 31.9997 5.33337C17.2721 5.33337 5.33301 17.2724 5.33301 32C5.33301 46.7276 17.2721 58.6667 31.9997 58.6667Z"
               fill="#FFE8E8"
               stroke="#FF1616"
               strokeWidth="4"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M40 24H24V40H40V24Z"
               fill="#FF1616"
               stroke="#FF1616"
               strokeWidth="4"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}
