import { Typography } from "@mui/material"

import FramerBox from "components/views/common/FramerBox"

import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { statusStyles } from "./styles"

type Props = {
   onShineAnimationComplete?: () => void
}

export const ModuleCompletedChip = ({ onShineAnimationComplete }: Props) => {
   const isMobile = useIsMobile()
   return (
      <Box display="flex">
         <Box sx={[statusStyles.completed, statusStyles.chip]}>
            <FramerBox
               sx={statusStyles.shine}
               initial={{ transform: "skewX(-45deg) translateX(-100%)" }}
               animate={{ transform: "skewX(-45deg) translateX(300%)" }}
               transition={{
                  duration: 2,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.5,
               }}
               onAnimationComplete={onShineAnimationComplete}
            />
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="14"
               height="14"
               viewBox="0 0 14 14"
               fill="none"
            >
               <path
                  d="M6.99935 8.75016C9.25451 8.75016 11.0827 6.92199 11.0827 4.66683C11.0827 2.41167 9.25451 0.583496 6.99935 0.583496C4.74419 0.583496 2.91602 2.41167 2.91602 4.66683C2.91602 6.92199 4.74419 8.75016 6.99935 8.75016Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
               <path
                  d="M4.78982 8.10251L4.08398 13.4167L7.00065 11.6667L9.91732 13.4167L9.21148 8.09668"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
            </svg>
            <Typography
               ml={0.5}
               variant={isMobile ? "xsmall" : "small"}
               component="p"
               color="inherit"
            >
               Level cleared
            </Typography>
         </Box>
      </Box>
   )
}
