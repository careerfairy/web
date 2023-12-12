import {
   Box,
   Step,
   StepConnector,
   StepIconProps,
   StepLabel,
   Stepper,
   Typography,
   stepConnectorClasses,
   stepLabelClasses,
   styled,
} from "@mui/material"
import { useOnboarding } from "./OnboardingProvider"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      px: 2.5,
      py: 4,
      bgcolor: "#FAFAFA",
      minWidth: 240,
      borderRadius: 2,
   },
   stepLabelWrapper: {
      py: 0,
   },
   stepLabel: {
      fontSize: "1.285rem !important",
      color: "secondary.main",
      textWrap: "noWrap",
   },
   labelDisabled: {
      color: "#6B6B7F",
   },
   labelCompleted: {
      color: "#9580F0",
   },
   labelActive: {
      fontWeight: 700,
   },
   stepIcon: {
      width: 14,
      height: 14,
      borderRadius: "50%",
      bgcolor: "#EBEBEF",
   },
   stepIconActive: {
      bgcolor: "secondary.main",
   },
})

const TimelineStepper = () => {
   const { activeStep, steps } = useOnboarding()

   return (
      <Box sx={styles.root}>
         <Stepper
            connector={<ColorlibConnector />}
            activeStep={activeStep}
            orientation="vertical"
         >
            {steps.map((step, index) => (
               <Step key={step.stepLabel}>
                  <StepLabel
                     StepIconComponent={StepIcon}
                     sx={styles.stepLabelWrapper}
                  >
                     <Typography
                        sx={[
                           styles.stepLabel,
                           getStepCompleted(activeStep, index) &&
                              styles.labelCompleted,
                           getStepDisabled(activeStep, index) &&
                              styles.labelDisabled,
                           getActiveStep(activeStep, index) &&
                              styles.labelActive,
                        ]}
                     >
                        {step.stepLabel}
                     </Typography>
                  </StepLabel>
               </Step>
            ))}
         </Stepper>
      </Box>
   )
}

const StepIcon = ({ active, completed }: StepIconProps) => {
   return (
      <Box
         sx={[styles.stepIcon, (active || completed) && styles.stepIconActive]}
      />
   )
}

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
   marginLeft: 10,
   [`&.${stepConnectorClasses.alternativeLabel}`]: {
      //   top: 22,
   },
   [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
         //  backgroundImage:
         //     "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
      },
   },
   [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
         //  backgroundImage: "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
      },
   },
   [`& .${stepConnectorClasses.line}`]: {
      height: 30,
      borderWidth: 2,
      bgcolor: "#E0E0E0",
      //   border: 0,
      //   borderRadius: 1,
   },
}))

const getStepCompleted = (activeStep: number, index: number) => {
   return activeStep > index
}

const getStepDisabled = (activeStep: number, index: number) => {
   return activeStep < index
}

const getActiveStep = (activeStep: number, index: number) => {
   return activeStep === index
}

export default TimelineStepper
