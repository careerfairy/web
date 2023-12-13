import { Button, Stack } from "@mui/material"
import PartyPopperIcon from "components/views/common/icons/PartyPopperIcon"
import { sxStyles } from "types/commonTypes"
import { useOnboarding } from "./OnboardingProvider"
import TimelineView from "./TimelineView"

const styles = sxStyles({
   root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      "& button": {
         textTransform: "none",
      },
   },
   icon: {
      color: "secondary.main",
      width: 64,
      height: 64,
   },
})

const WelcomeView = () => {
   const { handleNext, completeOnboarding } = useOnboarding()

   return (
      <Stack
         spacing={4}
         justifyContent="center"
         alignItems="center"
         sx={styles.root}
      >
         <Stack
            justifyContent="center"
            alignItems="center"
            textAlign="center"
            maxWidth={443}
            spacing={1}
         >
            <PartyPopperIcon sx={styles.icon} />
            <TimelineView.Title>Welcome to Sparks!</TimelineView.Title>
            <TimelineView.Description>
               Get ready to ignite your talent community with engaging videos.
               On the upcoming tutorial we guide you through the Sparks feature
               and how to create the best content.
            </TimelineView.Description>
         </Stack>
         <Stack spacing={0.5}>
            <Button onClick={handleNext} variant="contained" color="secondary">
               Watch tutorial
            </Button>
            <Button onClick={completeOnboarding} variant="text" color="grey">
               Skip
            </Button>
         </Stack>
      </Stack>
   )
}

export default WelcomeView
