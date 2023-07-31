import * as React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

const ExitIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 68 67" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="68"
            height="67"
            viewBox="0 0 68 67"
            fill="none"
         >
            <path
               d="M25.5 58.625L14.1667 58.625C12.6638 58.625 11.2224 58.0368 10.1597 56.9897C9.09702 55.9426 8.5 54.5225 8.5 53.0417L8.5 13.9583C8.5 12.4775 9.09703 11.0574 10.1597 10.0103C11.2224 8.96325 12.6638 8.37501 14.1667 8.37501L25.5 8.37501"
               stroke="#6749EA"
               strokeWidth="6"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M39.668 19.5416L25.5013 33.4999L39.668 47.4583"
               stroke="#6749EA"
               strokeWidth="6"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M25.5 33.5L59.5 33.5"
               stroke="#6749EA"
               strokeWidth="6"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}

export default ExitIcon
