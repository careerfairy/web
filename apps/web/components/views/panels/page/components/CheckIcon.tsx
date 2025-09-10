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
               d="M13.3346 4L6.0013 11.3333L2.66797 8"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}
