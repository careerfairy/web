import { Stack } from "@mui/material"
import Dialog, { DialogProps } from "@mui/material/Dialog"
import { useAuth } from "HOCs/AuthProvider"
import { sxStyles } from "types/commonTypes"
import { OnboardingProvider } from "./OnboardingProvider"
import TimelineStepper from "./TimelineStepper"
import TimelineView from "./TimelineView"

const styles = sxStyles({
   paper: {
      maxWidth: 858,
      br: 2,
   },
})

const SparksOnboardingDialog = () => {
   const { userData } = useAuth()

   const onboardingCompleted = Boolean(userData.hasCompletedSparksB2BOnboarding)

   return (
      <OnboardingProvider>
         <Dialog
            maxWidth="xl"
            PaperProps={PaperProps}
            fullWidth
            // open={!onboardingCompleted}
            open={true}
         >
            <Stack p={2} spacing={3} direction="row">
               <TimelineStepper />
               <TimelineView />
            </Stack>
         </Dialog>
      </OnboardingProvider>
   )
}

const PaperProps: DialogProps["PaperProps"] = {
   sx: styles.paper,
}

export default SparksOnboardingDialog
