import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const WifiIcon = ({
   barsNumber,
   ...props
}: SvgIconProps & { barsNumber: number }) => {
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
               d="M1.41992 9.00028C4.34234 6.42425 8.10422 5.00293 11.9999 5.00293C15.8956 5.00293 19.6575 6.42425 22.5799 9.00028"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               stroke={barsNumber >= 4 ? "currentColor" : "#D6D6E0"}
            />
            <path
               d="M5 12.5498C6.97656 10.9035 9.46761 10.002 12.04 10.002C14.6124 10.002 17.1034 10.9035 19.08 12.5498"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               stroke={barsNumber >= 3 ? "currentColor" : "#D6D6E0"}
            />
            <path
               d="M8.53027 16.1097C9.54548 15.3885 10.7599 15.001 12.0053 15.001C13.2506 15.001 14.4651 15.3885 15.4803 16.1097"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               stroke={barsNumber >= 2 ? "currentColor" : "#D6D6E0"}
            />
            <path
               d="M12 20H12.01"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               stroke={barsNumber >= 1 ? "currentColor" : "#D6D6E0"}
            />
         </svg>
      </SvgIcon>
   )
}
