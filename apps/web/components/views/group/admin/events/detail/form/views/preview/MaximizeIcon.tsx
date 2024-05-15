import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

const MaximizeIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon {...props}>
         <svg
            width={"36"}
            height={"30"}
            viewBox="0 0 36 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <rect
               x="0.5"
               y="0.5"
               width="35"
               height="29"
               rx="14.5"
               stroke="#C2C2D0"
            />
            <path
               d="M19.75 9.75H23.25V13.25"
               stroke="#8E8E8E"
               stroke-width="1.5"
               stroke-linecap="round"
               stroke-linejoin="round"
            />
            <path
               d="M16.25 20.25H12.75V16.75"
               stroke="#8E8E8E"
               stroke-width="1.5"
               stroke-linecap="round"
               stroke-linejoin="round"
            />
            <path
               d="M23.2501 9.75L19.1667 13.8333"
               stroke="#8E8E8E"
               stroke-width="1.5"
               stroke-linecap="round"
               stroke-linejoin="round"
            />
            <path
               d="M12.75 20.2498L16.8333 16.1665"
               stroke="#8E8E8E"
               stroke-width="1.5"
               stroke-linecap="round"
               stroke-linejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}

export default MaximizeIcon
