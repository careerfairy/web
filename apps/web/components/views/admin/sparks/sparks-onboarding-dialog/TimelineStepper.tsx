import {
   Box,
   Step,
   StepConnector,
   StepIconProps,
   StepLabel,
   Stepper,
   Typography,
   stepConnectorClasses,
   styled,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useOnboarding } from "./OnboardingProvider"

const styles = sxStyles({
   root: {
      px: 2.5,
      py: 4,
      pt: "38.5px",
      bgcolor: "#FAFAFA",
      borderRadius: 2,
   },
   stepLabelWrapper: {
      py: 0,
      mb: "-6.5px",
      mt: "-6.5px",
   },
   stepLabel: {
      fontSize: "1.285rem !important",
      color: "secondary.main",
      textWrap: "noWrap",
      fontWeight: 500,
      transition: (theme) => theme.transitions.create("color"),
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
   marginLeft: 6,
   [`& .${stepConnectorClasses.line}`]: {
      height: 42,
      borderColor: theme.palette.secondary.main,
      borderWidth: 2,
      bgcolor: "#E0E0E0",
   },
   [`&.${stepConnectorClasses.disabled}`]: {
      [`& .${stepConnectorClasses.line}`]: {
         borderColor: "#EBEBEF",
      },
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
