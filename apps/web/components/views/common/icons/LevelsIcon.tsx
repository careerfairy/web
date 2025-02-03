import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const LevelsIcon = ({ fill = "none", ...props }: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 24 24" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
         >
            <path
               d="M12 2L2 7L12 12L22 7L12 2Z"
               stroke="currentColor"
               strokeWidth={fill == "none" ? "1.5" : 2}
               strokeLinecap="round"
               strokeLinejoin="round"
               fill={fill}
            />
            <path
               d="M2 17L12 22L22 17"
               stroke="currentColor"
               strokeWidth={fill == "none" ? "1.5" : 2}
               strokeLinecap="round"
               strokeLinejoin="round"
               fill="none"
            />
            <path
               d="M2 12L12 17L22 12"
               stroke="currentColor"
               strokeWidth={fill == "none" ? "1.5" : 2}
               strokeLinecap="round"
               strokeLinejoin="round"
               fill="none"
            />
         </svg>
      </SvgIcon>
   )
}
