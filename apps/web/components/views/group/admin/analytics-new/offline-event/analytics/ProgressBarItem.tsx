import { Box, LinearProgress, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const progressBarStyles = sxStyles({
   // Mobile styles
   mobileRow: {
      display: "flex",
      flexDirection: "column",
      gap: 0.5,
   },
   mobileHeader: {
      display: "flex",
      alignItems: "center",
      gap: 1.5,
   },
   mobileName: {
      flex: 1,
      lineHeight: "24px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
   },
   mobilePercentage: {
      textAlign: "right",
      lineHeight: "16px",
   },
   mobileProgressBar: {
      width: "100%",
      height: 17,
      borderRadius: "27px",
      backgroundColor: "neutral.50",
      "& .MuiLinearProgress-bar": {
         borderRadius: "27px",
         backgroundColor: "secondary.600",
      },
   },
   // Desktop styles
   desktopRow: {
      display: "flex",
      alignItems: "center",
      gap: 1.5,
   },
   desktopBarContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 2,
   },
   desktopName: {
      width: 200,
      lineHeight: "24px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
   },
   desktopPercentage: {
      width: 52,
      textAlign: "right",
      lineHeight: "16px",
   },
   desktopProgressBar: {
      flex: 1,
      height: 17,
      borderRadius: "27px",
      backgroundColor: "neutral.50",
      "& .MuiLinearProgress-bar": {
         borderRadius: "27px",
         backgroundColor: "secondary.600",
      },
   },
})

type ProgressBarItemProps = {
   name: string
   percentage: number
   isMobile: boolean
}

export const ProgressBarItem = ({
   name,
   percentage,
   isMobile,
}: ProgressBarItemProps) => {
   if (isMobile) {
      return (
         <Box sx={progressBarStyles.mobileRow}>
            <Box sx={progressBarStyles.mobileHeader}>
               <Typography
                  variant="medium"
                  color="neutral.700"
                  sx={progressBarStyles.mobileName}
               >
                  {name}
               </Typography>
               <Typography
                  variant="xsmall"
                  color={(theme) => theme.brand.black[700]}
                  sx={progressBarStyles.mobilePercentage}
               >
                  {percentage}%
               </Typography>
            </Box>
            <LinearProgress
               variant="determinate"
               value={percentage}
               sx={progressBarStyles.mobileProgressBar}
            />
         </Box>
      )
   }

   // Desktop version - original layout
   return (
      <Box sx={progressBarStyles.desktopRow}>
         <Box sx={progressBarStyles.desktopBarContainer}>
            <Typography
               variant="medium"
               color="neutral.700"
               sx={progressBarStyles.desktopName}
            >
               {name}
            </Typography>
            <LinearProgress
               variant="determinate"
               value={percentage}
               sx={progressBarStyles.desktopProgressBar}
            />
         </Box>
         <Typography
            variant="xsmall"
            color={(theme) => theme.brand.black[700]}
            sx={progressBarStyles.desktopPercentage}
         >
            {percentage}%
         </Typography>
      </Box>
   )
}
