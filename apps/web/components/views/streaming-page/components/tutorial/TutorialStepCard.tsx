import { LoadingButton } from "@mui/lab"
import { Box, LinearProgress, Stack, Typography } from "@mui/material"
import { X } from "react-feather"
import { TooltipRenderProps } from "react-joyride"
import { sxStyles } from "types/commonTypes"
import { useLivestreamTutorial } from "./LivestreamTutorialProvider"
import { TutorialStepsInfo } from "./TutorialSteps"

const styles = sxStyles({
   root: {
      backgroundColor: (theme) => theme.brand.white[100],
      color: (theme) => theme.palette.neutral["700"],
      p: 0,
      maxWidth: "302px",
      paddingBottom: "12px",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "12px",
      borderRadius: "8px",
   },
   content: {
      padding: " 0px 12px",
      justifyContent: "center",
      alignItems: "flex-end",
      gap: "8px",
      alignSelf: "stretch",
      lineHeight: "20px",
      fontWeight: 400,
   },
   header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "stretch",
      fontWeight: 700,
   },
   title: {
      color: (theme) => theme.palette.neutral[800],
   },
   closeButton: {
      color: (theme) => theme.palette.neutral[400],
      cursor: "pointer",
   },
   progress: {
      height: "9px",
      borderRadius: "8px 8px 0 0",
   },
})

export const TutorialStepCard = ({
   index,
   step,
   primaryProps,
   tooltipProps,
}: TooltipRenderProps) => {
   const { handleSkipTutorial, isWaiting } = useLivestreamTutorial()

   return (
      <Stack {...tooltipProps} sx={styles.root}>
         <Box sx={{ width: "100%" }}>
            <LinearProgress
               variant="determinate"
               value={((index + 1) * 100) / TutorialStepsInfo.length}
               sx={styles.progress}
            />
         </Box>
         <Stack sx={styles.content}>
            <Stack spacing={0.5}>
               <Box sx={styles.header}>
                  <Typography variant="small" sx={styles.title}>
                     {step.title}
                  </Typography>
                  <Box
                     component={X}
                     onClick={handleSkipTutorial}
                     sx={styles.closeButton}
                  />
               </Box>
               <Typography variant="small">{step.content}</Typography>
            </Stack>
            <LoadingButton
               fullWidth
               variant="contained"
               {...primaryProps}
               loading={isWaiting}
            >
               Next
            </LoadingButton>
         </Stack>
      </Stack>
   )
}
