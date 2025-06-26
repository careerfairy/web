import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const AnalyticsIcon = ({ fill, ...props }: SvgIconProps) => {
   const isFilled = fill === "currentColor"

   const strokeWidth = isFilled ? "2.5" : "1.5"

   return (
      <SvgIcon viewBox="0 0 24 24" {...props} fill={fill}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
         >
            <path
               d="M18 20V10"
               stroke="currentColor"
               strokeWidth={strokeWidth}
               strokeLinecap="round"
            />
            <path
               d="M12 20V4"
               stroke="currentColor"
               strokeWidth={strokeWidth}
               strokeLinecap="round"
            />
            <path
               d="M6 20V14"
               stroke="currentColor"
               strokeWidth={strokeWidth}
               strokeLinecap="round"
            />
         </svg>
      </SvgIcon>
   )
}
