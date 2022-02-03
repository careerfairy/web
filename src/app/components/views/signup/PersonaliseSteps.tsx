import MultiStepWrapper, {
  MultiStepComponentType,
} from "./MultiStepWrapper";
import React, {useEffect, useState} from "react";
import GroupProvider from "./GroupProvider";
import {Box, Button, Grid, Typography} from "@mui/material";
import {
  SIGNUP_REDIRECT_PATH,
  SignupStepper
} from "../../../pages/signup";
import InterestsSelector from "./InterestsSelector";
import { useRouter } from "next/router";

const steps: MultiStepComponentType[] = [
  {
    component: () => InterestsSelector,
    description: "Interests"
  },
  {
    component: () => GroupProvider,
    description: "Join Groups"
  },
]

const PersonaliseSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const {push} = useRouter();

  const handleSkip = () => {
    if(currentStep === steps.length - 1) {
      void push(SIGNUP_REDIRECT_PATH)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  return (
    <>
      <Box mb={2}>
        <SignupStepper steps={steps} currentStep={currentStep}/>
      </Box>

      <MultiStepWrapper steps={steps} currentStep={currentStep}
                        setCurrentStep={setCurrentStep}/>

      <Grid container alignItems="center">
        <Grid item xs={6}>
          <Typography variant="body2"
                      color="textSecondary">Step {currentStep + 1} of {steps.length}</Typography>
        </Grid>
        <Grid item style={{textAlign: 'right'}} xs={6}>
          <Button onClick={handleSkip}>Skip</Button>
        </Grid>
      </Grid>
    </>
  )
}

export default PersonaliseSteps
