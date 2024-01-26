import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const PlaceholderImageIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 25 24" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
         >
            <path
               d="M19.6641 3H5.66406C4.55949 3 3.66406 3.89543 3.66406 5V19C3.66406 20.1046 4.55949 21 5.66406 21H19.6641C20.7686 21 21.6641 20.1046 21.6641 19V5C21.6641 3.89543 20.7686 3 19.6641 3Z"
               stroke="currentColor"
               strokeOpacity="0.54"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M9.16406 10C9.99249 10 10.6641 9.32843 10.6641 8.5C10.6641 7.67157 9.99249 7 9.16406 7C8.33564 7 7.66406 7.67157 7.66406 8.5C7.66406 9.32843 8.33564 10 9.16406 10Z"
               stroke="currentColor"
               strokeOpacity="0.54"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M21.6641 15L16.6641 10L5.66406 21"
               stroke="currentColor"
               strokeOpacity="0.54"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}
