import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useOnboarding } from "./OnboardingProvider"

const styles = sxStyles({
   root: {
      minHeight: {
         xs: 300,
         sm: 432,
      },
   },
})

const TimelineView = () => {
   const { activeStep, steps, handleNext, handleBack } = useOnboarding()
   return (
      <Box sx={styles.root}>
         {steps[activeStep].view}
         <Button variant="text" color="grey" onClick={handleBack}>
            Demo Back
         </Button>
         <Button variant="contained" color="secondary" onClick={handleNext}>
            Demo Next
         </Button>
      </Box>
   )
}

export default TimelineView
