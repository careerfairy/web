import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const RecordingPlayIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 24 24" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="68"
            height="68"
            viewBox="0 0 68 68"
            fill="none"
         >
            <path
               d="M34 62.3334C49.648 62.3334 62.3333 49.6481 62.3333 34.0001C62.3333 18.352 49.648 5.66675 34 5.66675C18.3519 5.66675 5.66663 18.352 5.66663 34.0001C5.66663 49.6481 18.3519 62.3334 34 62.3334Z"
               fill="white"
               fillOpacity="0.42"
            />
            <path
               d="M28.3334 22.6667L45.3334 34.0001L28.3334 45.3334V22.6667Z"
               fill="white"
               stroke="white"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </SvgIcon>
   )
}
