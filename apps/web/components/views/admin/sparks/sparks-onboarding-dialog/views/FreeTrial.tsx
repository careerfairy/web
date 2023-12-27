import { Box, Stack, Typography } from "@mui/material"
import { Clock } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useOnboarding } from "../OnboardingProvider"
import TimelineView from "../TimelineView"

const styles = sxStyles({
   root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
   },
   icon: {
      color: "secondary.main",
      width: 64,
      height: 64,
   },
   centered: {
      textAlign: "center",
      justifyContent: "center",
      alignItems: "center",
   },
   trialNoticeWrapper: {
      borderRadius: 2,
      py: 1,
      px: 1.2,
      bgcolor: "#FAFAFE",
      border: "1px solid #F6F6FA",
   },
   noticeText: {
      fontSize: "1.142rem",
      fontWeight: 600,
      color: "secondary.main",
      textAlign: "center",
      lineHeight: "240%",
   },
})

const CONTENT_MAX_WIDTH = 460

const FreeTrial = () => {
   const { completeOnboarding } = useOnboarding()

   return (
      <Stack spacing={2.5} sx={styles.root}>
         <Stack maxWidth={CONTENT_MAX_WIDTH} spacing={1}>
            <Stack sx={styles.centered} spacing={1}>
               <Box component={Clock} sx={styles.icon} />
               <TimelineView.Title>
                  Your free trial starts now
               </TimelineView.Title>
               <TimelineView.Description>
                  You&apos;re now ready to start using Sparks at its best! Your
                  trial period starts now, with the following dates:
               </TimelineView.Description>
            </Stack>
         </Stack>
         <Box maxWidth={CONTENT_MAX_WIDTH} sx={styles.trialNoticeWrapper}>
            <Typography variant="body2" sx={styles.noticeText}>
               2-week content creation period <br /> 2 months in which Sparks
               are visible on CareerFairy
            </Typography>
         </Box>
         <Box sx={styles.centered}>
            <TimelineView.Description pb={4} color="#7A7A8E">
               You can upload up to 6 public Sparks from 1 employee
            </TimelineView.Description>
            <TimelineView.Button
               onClick={completeOnboarding}
               variant="contained"
               color="secondary"
            >
               Get started
            </TimelineView.Button>
         </Box>
      </Stack>
   )
}

export default FreeTrial
