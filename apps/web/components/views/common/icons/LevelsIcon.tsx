import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

type LevelsIconProps = SvgIconProps & {
   isOutlined?: boolean
}

export const LevelsIcon = ({ isOutlined, ...props }: LevelsIconProps) => {
   if (isOutlined) {
      return (
         <SvgIcon viewBox="0 0 16 16" {...props}>
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="16"
               height="16"
               viewBox="0 0 16 16"
               fill="none"
            >
               <g>
                  <path
                     d="M8.00065 1.33301L1.33398 4.66634L8.00065 7.99967L14.6673 4.66634L8.00065 1.33301Z"
                     stroke="currentColor"
                     strokeWidth="1.5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
                  <path
                     d="M1.33398 11.333L8.00065 14.6663L14.6673 11.333"
                     stroke="currentColor"
                     strokeWidth="1.5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
                  <path
                     d="M1.33398 8L8.00065 11.3333L14.6673 8"
                     stroke="currentColor"
                     strokeWidth="1.5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
               </g>
               <defs>
                  <clipPath id="clip0_16149_138847">
                     <rect width="16" height="16" fill="white" />
                  </clipPath>
               </defs>
            </svg>
         </SvgIcon>
      )
   }

   return (
      <SvgIcon viewBox="0 0 24 24" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
         >
            <path
               d="M12 2L2 7L12 12L22 7L12 2Z"
               fill="currentColor"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M2 17L12 22L22 17"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M2 12L12 17L22 12"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}
