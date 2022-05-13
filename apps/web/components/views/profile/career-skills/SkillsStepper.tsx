import { Step, StepLabel, Stepper } from "@mui/material"
import React from "react"
import { styled } from "@mui/material/styles"
import StepConnector, {
   stepConnectorClasses,
} from "@mui/material/StepConnector"
import IconButton from "@mui/material/IconButton"
import InfoIcon from "@mui/icons-material/Info"
import { createStyles } from "@mui/styles"

const styles = createStyles({
   step: {
      padding: 0,
   },
   stepLabel: {
      padding: 0,
      margin: 0,
      "& .MuiStepLabel-iconContainer": {
         padding: 0,
      },
   },
})

const steps = ["test"]

export const SkillsStepper = () => {
   return (
      <Stepper nonLinear activeStep={1} connector={<ColorlibConnector />}>
         {steps.map((label, index) => (
            <Step key={label} completed={false} disabled sx={styles.step}>
               <StepLabel
                  StepIconComponent={IconContainer}
                  sx={styles.stepLabel}
               />
            </Step>
         ))}
      </Stepper>
   )
}

const IconContainer = ({ children }) => {
   return (
      <IconButton>
         <InfoIcon color="secondary" />
      </IconButton>
   )
}

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
   [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
   },
   [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
         backgroundColor: theme.palette.secondary.main,
      },
   },
   [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
         backgroundColor: theme.palette.secondary.main,
      },
   },
   [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor:
         theme.palette.mode === "dark" ? theme.palette.grey[800] : "#FAEDF2",
      borderRadius: 1,
   },
}))
