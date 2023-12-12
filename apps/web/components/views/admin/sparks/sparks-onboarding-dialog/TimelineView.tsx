import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useOnboarding } from "./OnboardingProvider"

const styles = sxStyles({
   root: {},
})

const TimelineView = () => {
   const { activeStep, steps } = useOnboarding()
   return <Box sx={styles.root}>{steps[activeStep].view}</Box>
}

export default TimelineView
