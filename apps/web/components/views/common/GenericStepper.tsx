import { styled } from "@mui/styles"
import {
   Box,
   Step,
   StepConnector,
   StepIconProps,
   StepLabel,
   Stepper,
   Typography,
} from "@mui/material"
import { stepConnectorClasses } from "@mui/material/StepConnector"
import Check from "@mui/icons-material/Check"
import React from "react"
import { MultiStepComponentType } from "./MultiStepWrapper"
import useIsMobile from "../../custom-hook/useIsMobile"

const StepperConnector = styled(StepConnector)(({ theme }) => ({
   [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 10,
      left: "calc(-50% + 15px)",
      right: "calc(50% + 15px)",
   },
   [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
         borderColor: theme.palette.primary.main,
      },
   },
   [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
         borderColor: theme.palette.primary.main,
      },
   },
   [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.grey.main,
      borderTopWidth: 4,
      borderRadius: 1,
   },
}))

const StepperIconRoot = ({ active, children, className }) => {
   const StyledIcons = styled("div")(({ theme }) => ({
      color: theme.palette.grey.main,
      display: "flex",
      height: 22,
      alignItems: "center",
      ...(active && {
         color: theme.palette.primary.main,
      }),
      "& .stepper-completedIcon": {
         color: theme.palette.primary.main,
         zIndex: 1,
         fontSize: 18,
      },
      "& .stepper-circle": {
         width: 8,
         height: 8,
         borderRadius: "50%",
         backgroundColor: "currentColor",
      },
   }))

   return <StyledIcons className={className}>{children}</StyledIcons>
}

const StepperIcon = (props: StepIconProps) => {
   const { active, completed, className } = props

   return (
      <StepperIconRoot active={active} className={className}>
         {completed ? (
            <Check className="stepper-completedIcon" />
         ) : (
            <div className="stepper-circle" />
         )}
      </StepperIconRoot>
   )
}

type GenericStepperProps = {
   currentStep: number
   steps: MultiStepComponentType[]
}

const GenericStepper = ({ currentStep, steps }: GenericStepperProps) => {
   const isMobile = useIsMobile()

   return (
      <>
         {isMobile && (
            <Box textAlign="center" mb={1}>
               <Typography variant="body2" fontWeight="bold">
                  {steps[currentStep].description}
               </Typography>
            </Box>
         )}
         <Stepper
            activeStep={currentStep}
            alternativeLabel
            connector={<StepperConnector />}
         >
            {steps.map((step, i) => (
               <Step key={i}>
                  <StepLabel StepIconComponent={StepperIcon}>
                     {isMobile ? null : step.description}
                  </StepLabel>
               </Step>
            ))}
         </Stepper>
      </>
   )
}

export default GenericStepper
