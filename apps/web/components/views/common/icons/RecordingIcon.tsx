import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const RecordingIcon = ({ fill = "none", ...props }: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 24 24" fill={fill} {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
         >
            <path
               d="M17.5556 10V6.11111C17.5556 5.5 17.0556 5 16.4444 5H3.11111C2.5 5 2 5.5 2 6.11111V17.2222C2 17.8333 2.5 18.3333 3.11111 18.3333H16.4444C17.0556 18.3333 17.5556 17.8333 17.5556 17.2222V13.3333L20.1 15.8778C20.8 16.5778 22 16.0778 22 15.0889V8.23333C22 7.24444 20.8 6.74444 20.1 7.44444L17.5556 10Z"
               stroke="currentColor"
               strokeWidth={fill == "none" ? "1.5" : "0.3"}
            />
         </svg>
      </SvgIcon>
   )
}
