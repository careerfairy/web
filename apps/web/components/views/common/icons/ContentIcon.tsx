import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const ContentIcon = ({ fill, ...props }: SvgIconProps) => {
   const isFilled = fill === "currentColor"

   if (isFilled) {
      return (
         <SvgIcon viewBox="0 0 24 25" {...props} fill={fill}>
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="24"
               height="25"
               viewBox="0 0 24 25"
               fill="none"
            >
               <g clipPath="url(#clip0_20477_4070)">
                  <path
                     d="M12 2.03027C6.48 2.03027 2 6.51027 2 12.0303C2 17.5503 6.48 22.0303 12 22.0303C17.52 22.0303 22 17.5503 22 12.0303C22 6.51027 17.52 2.03027 12 2.03027ZM9.5 14.7003V9.36027C9.5 8.57027 10.38 8.09027 11.04 8.52027L15.19 11.1903C15.8 11.5803 15.8 12.4803 15.19 12.8703L11.04 15.5403C10.38 15.9703 9.5 15.4903 9.5 14.7003Z"
                     fill="currentColor"
                     stroke="currentColor"
                  />
               </g>
               <defs>
                  <clipPath id="clip0_20477_4070">
                     <rect
                        width="24"
                        height="24"
                        fill="white"
                        transform="translate(0 0.0302734)"
                     />
                  </clipPath>
               </defs>
            </svg>
         </SvgIcon>
      )
   }

   return (
      <SvgIcon viewBox="0 0 24 24" {...props} fill={fill}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
         >
            <g clipPath="url(#clip0_20477_4045)">
               <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67V9.33C9.5 8.54 10.38 8.06 11.04 8.49L15.19 11.16C15.8 11.55 15.8 12.45 15.19 12.84L11.04 15.51C10.38 15.94 9.5 15.46 9.5 14.67Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
               />
            </g>
            <defs>
               <clipPath id="clip0_20477_4045">
                  <rect width="24" height="24" fill="white" />
               </clipPath>
            </defs>
         </svg>
      </SvgIcon>
   )
}
