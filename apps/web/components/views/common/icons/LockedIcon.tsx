import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

const LockedIcon = (props: SvgIconProps) => {
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
               d="M50.6667 29.3333H13.3333C10.3878 29.3333 8 31.7211 8 34.6666V53.3333C8 56.2788 10.3878 58.6666 13.3333 58.6666H50.6667C53.6122 58.6666 56 56.2788 56 53.3333V34.6666C56 31.7211 53.6122 29.3333 50.6667 29.3333Z"
               stroke="currentColor"
               stroke-width="5"
               stroke-linecap="round"
               stroke-linejoin="round"
            />
            <path
               d="M18.668 29.3333V18.6666C18.6647 15.36 19.8901 12.1702 22.1063 9.71637C24.3226 7.2625 27.3715 5.71966 30.6613 5.38736C33.9511 5.05506 37.247 5.957 39.9092 7.91809C42.5714 9.87918 44.41 12.7595 45.068 15.9999"
               stroke="currentColor"
               stroke-width="5"
               stroke-linecap="round"
               stroke-linejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}

export default LockedIcon
