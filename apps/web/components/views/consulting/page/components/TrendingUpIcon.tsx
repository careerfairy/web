import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const TrendingUpIcon = (props: SvgIconProps) => {
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
               d="M1.33203 12.666L5.33203 8.66602L8.66536 11.9994L14.6654 5.99935"
               stroke="currentColor"
               strokeWidth="1.5"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M10.668 5.99935H14.668V9.99935"
               stroke="currentColor"
               strokeWidth="1.5"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}