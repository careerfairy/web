import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import useIsMobile from "components/custom-hook/useIsMobile"

export const ConversionBadgeIcon = (props: SvgIconProps) => {
   const isMobile = useIsMobile()

   if (isMobile) {
      return (
         <SvgIcon viewBox="0 0 46 88" {...props}>
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="46"
               height="88"
               viewBox="0 0 46 88"
               fill="none"
            >
               <path
                  d="M0.499996 0.5L36.4492 0.499998L44.8926 42.2988C45.2863 44.2481 45.2743 46.2575 44.8584 48.2021L36.4531 87.5L0.5 87.5L0.499996 0.5Z"
                  fill="#F6F6FA"
                  stroke="#EBEBEF"
               />
            </svg>
         </SvgIcon>
      )
   }

   return (
      <SvgIcon viewBox="0 0 70 84" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="70"
            height="84"
            viewBox="0 0 70 84"
            fill="none"
         >
            <path
               d="M0.499996 0.5L55.7246 0.499998L68 38.6211C68.9564 41.5913 68.9288 44.7906 67.9219 47.7441L55.7314 83.5L0.5 83.5L0.499996 0.5Z"
               fill="#F6F6FA"
               stroke="#EBEBEF"
            />
         </svg>
      </SvgIcon>
   )
}
