import { SvgIcon, SvgIconProps } from "@mui/material"

export const XCircleIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
         >
            <g clipPath="url(#clip0_19545_25567)">
               <path
                  d="M9.99935 18.3333C14.6017 18.3333 18.3327 14.6024 18.3327 9.99999C18.3327 5.39762 14.6017 1.66666 9.99935 1.66666C5.39698 1.66666 1.66602 5.39762 1.66602 9.99999C1.66602 14.6024 5.39698 18.3333 9.99935 18.3333Z"
                  fill="#8E8E8E"
                  stroke="#8E8E8E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
               <path
                  d="M12.5 7.5L7.5 12.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
               <path
                  d="M7.5 7.5L12.5 12.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
            </g>
            <defs>
               <clipPath id="clip0_19545_25567">
                  <rect width="20" height="20" fill="white" />
               </clipPath>
            </defs>
         </svg>
      </SvgIcon>
   )
}
