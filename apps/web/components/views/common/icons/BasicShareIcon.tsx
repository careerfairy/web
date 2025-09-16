import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const BasicShareIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 20 20" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
         >
            <path
               d="M11.6667 7.33333V4L17.5 9.83333L11.6667 15.6667V12.25C7.5 12.25 4.58333 13.5833 2.5 16.5C3.33333 12.3333 5.83333 8.16667 11.6667 7.33333Z"
               stroke="white"
               strokeWidth="1.5"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}
