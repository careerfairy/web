import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const PinIcon = (props: SvgIconProps) => {
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
               d="M13.3346 6.66732C13.3346 9.99598 9.64197 13.4627 8.40197 14.5333C8.28645 14.6202 8.14583 14.6672 8.0013 14.6672C7.85677 14.6672 7.71615 14.6202 7.60064 14.5333C6.36064 13.4627 2.66797 9.99598 2.66797 6.66732C2.66797 5.25283 3.22987 3.89628 4.23007 2.89608C5.23026 1.89589 6.58681 1.33398 8.0013 1.33398C9.41579 1.33398 10.7723 1.89589 11.7725 2.89608C12.7727 3.89628 13.3346 5.25283 13.3346 6.66732Z"
               stroke="currentColor"
               strokeWidth="1.5"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M6 6.66732L7.33333 8.00065L10 5.33398"
               stroke="currentColor"
               strokeWidth="1.5"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}
