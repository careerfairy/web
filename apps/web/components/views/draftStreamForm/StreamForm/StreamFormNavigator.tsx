import {
   Box,
   Step,
   StepButton,
   StepConnector,
   StepLabel,
   Stepper,
   Typography,
} from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { styled } from "@mui/styles"
import makeStyles from "@mui/styles/makeStyles"

const StepperConnector = styled(StepConnector)(({ theme }) => ({
   visibility: "hidden",
}))

const useStyles = makeStyles((theme) => ({
   icon: {
      color: theme.palette.grey.main,
      width: 34,
      height: 34,
      fontWeight: "bold",

      "&:hover": {
         color: `${theme.palette.secondary.light} !important`,
      },
   },
   activeIcon: {
      color: `${theme.palette.secondary.main} !important`,
   },
}))

export type IStreamFormNavigatorSteps = {
   label: string
   ref: any
}

type Props = {
   steps: IStreamFormNavigatorSteps[]
}

const StreamFormNavigator = ({ steps }: Props) => {
   const classes = useStyles()
   const [currentStep, setCurrentStep] = useState(0)

   const getIsActive = useCallback(
      (currentIndex: number) => {
         return currentIndex === currentStep
      },
      [currentStep]
   )

   const handleStepChange = useCallback((stepNumber: number, stepRef?: any) => {
      stepRef?.current?.scrollIntoView({ behavior: "smooth" })
      setCurrentStep(stepNumber)
   }, [])

   const handleChange = useCallback(
      (selectedStepId) => {
         const stepId = steps.findIndex(
            ({ ref }) => ref.current.id === selectedStepId
         )

         handleStepChange(stepId)
      },
      [handleStepChange, steps]
   )

   useEffect(() => {
      // @ts-ignore
      if (!"IntersectionObserver" in window) {
         // this browser doesn't seem to support the IntersectionObserver API, do nothing
         return
      }

      let observer
      if (steps.length) {
         const options = {
            threshold: 1,
         }
         observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
               const stepId = entry.target.id
               if (entry.isIntersecting) {
                  handleChange(stepId)
               }
            })
         }, options)

         steps.forEach((tab) => observer.observe(tab.ref.current))
      }
      return () => observer?.disconnect()
   }, [handleChange, steps])

   return (
      <Box sx={{ width: "100%" }}>
         <Stepper
            nonLinear
            orientation="vertical"
            activeStep={currentStep}
            connector={<StepperConnector />}
         >
            {steps.map(({ label, ref }, index) => (
               <Step key={label} className="stepperIdentifier">
                  <StepButton onClick={() => handleStepChange(index, ref)}>
                     <StepLabel
                        StepIconProps={{
                           classes: {
                              root: `${classes.icon} ${
                                 getIsActive(index) && classes.activeIcon
                              }`,
                           },
                        }}
                     >
                        <Typography variant="h6">{label}</Typography>
                     </StepLabel>
                  </StepButton>
               </Step>
            ))}
         </Stepper>
      </Box>
   )
}

export default StreamFormNavigator
