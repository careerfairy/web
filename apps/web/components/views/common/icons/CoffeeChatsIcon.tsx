import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const CoffeeChatsBadge = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 22 22" {...props}>
         <circle cx="11" cy="11" r="11" fill="#957259" />
         <g transform="translate(4.5, 4.5)">
            <path
               d="M5.39209 1.07843V2.15686"
               stroke="white"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M7.54883 1.07843V2.15686"
               stroke="white"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M8.62748 4.31372C8.77049 4.31372 8.90764 4.37053 9.00876 4.47165C9.10988 4.57278 9.16669 4.70993 9.16669 4.85294V9.16666C9.16669 9.7387 8.93945 10.2873 8.53496 10.6918C8.13047 11.0963 7.58187 11.3235 7.00983 11.3235H3.77454C3.2025 11.3235 2.6539 11.0963 2.24941 10.6918C1.84492 10.2873 1.61768 9.7387 1.61768 9.16666V4.85294C1.61768 4.70993 1.67449 4.57278 1.77561 4.47165C1.87673 4.37053 2.01388 4.31372 2.15689 4.31372H9.70591C10.2779 4.31372 10.8266 4.54096 11.231 4.94545C11.6355 5.34994 11.8628 5.89855 11.8628 6.47058C11.8628 7.04262 11.6355 7.59123 11.231 7.99572C10.8266 8.40021 10.2779 8.62745 9.70591 8.62745H9.16669"
               stroke="white"
               strokeLinecap="round"
               strokeLinejoin="round"
               fill="none"
            />
            <path
               d="M3.23535 1.07843V2.15686"
               stroke="white"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </g>
      </SvgIcon>
   )
}
