import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const CheckIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 28 28" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
         >
            <path
               d="M13.3327 4.66602L5.99935 11.9994L2.66602 8.66602"
               stroke="currentColor"
               strokeWidth="1.5"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}