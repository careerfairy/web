import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

const PlusCircleIcon = (props: SvgIconProps) => {
   return (
      <SvgIcon viewBox="0 0 144 100" {...props}>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="144"
            height="100"
            viewBox="0 0 144 100"
            fill="none"
         >
            <g filter="url(#filter0_d_22679_11988)">
               <path
                  d="M71.5707 96.4913C85.2502 96.4913 96.3396 85.4019 96.3396 71.7224C96.3396 58.0429 85.2502 46.9535 71.5707 46.9535C57.8912 46.9535 46.8018 58.0429 46.8018 71.7224C46.8018 85.4019 57.8912 96.4913 71.5707 96.4913Z"
                  fill="#FEFEFE"
               />
               <path
                  d="M71.5707 96.4913C85.2502 96.4913 96.3396 85.4019 96.3396 71.7224C96.3396 58.0429 85.2502 46.9535 71.5707 46.9535C57.8912 46.9535 46.8018 58.0429 46.8018 71.7224C46.8018 85.4019 57.8912 96.4913 71.5707 96.4913Z"
                  stroke="#CCF6DA"
                  strokeWidth="1.10084"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
            </g>
            <path
               d="M61.6641 71.7229H81.4792"
               stroke="#00BD40"
               strokeWidth="4.40336"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M71.5713 61.8149V81.6301"
               stroke="#00BD40"
               strokeWidth="4.40336"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <defs>
               <filter
                  id="filter0_d_22679_11988"
                  x="0.015686"
                  y="0.167786"
                  width="143.109"
                  height="143.109"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
               >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                     in="SourceAlpha"
                     type="matrix"
                     values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="23.1176" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                     type="matrix"
                     values="0 0 0 0 0.0791667 0 0 0 0 0.0765278 0 0 0 0 0.0765278 0 0 0 0.08 0"
                  />
                  <feBlend
                     mode="normal"
                     in2="BackgroundImageFix"
                     result="effect1_dropShadow_22679_11988"
                  />
                  <feBlend
                     mode="normal"
                     in="SourceGraphic"
                     in2="effect1_dropShadow_22679_11988"
                     result="shape"
                  />
               </filter>
            </defs>
         </svg>
      </SvgIcon>
   )
}

export default PlusCircleIcon
