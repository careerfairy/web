import MultiStepWrapper, {
   MultiStepComponentType,
} from "../../common/MultiStepWrapper"
import React, { useState } from "react"
import { Box, Button, Grid, Typography } from "@mui/material"
import { SIGNUP_REDIRECT_PATH, SignupStepper } from "../../../../pages/signup"
import InterestsSelector from "./InterestsSelector"
import { useRouter } from "next/router"
import LoadingButton from "@mui/lab/LoadingButton"
import AdditionalInformation from "./AdditionalInformation"

const steps: MultiStepComponentType[] = [
   {
      component: () => AdditionalInformation,
      description: "Additional information",
   },
   {
      component: () => InterestsSelector,
      description: "Interests",
   },
]

const PersonaliseSteps = () => {
   const [currentStep, setCurrentStep] = useState(0)
   const { push } = useRouter()
   const isLastStep = currentStep === steps.length - 1
   const isFirstStep = currentStep === 0
   const [isLoadingRedirectPage, setIsLoadingRedirectPage] = useState(false)

   const handleContinue = () => {
      if (isLastStep) {
         // set a loading state in the Finalise button, the next page may take some seconds to render
         setIsLoadingRedirectPage(true)
         void push(SIGNUP_REDIRECT_PATH)
      } else {
         setCurrentStep((prev) => prev + 1)
      }
   }

   const handlePrevious = () => {
      if (!isFirstStep) {
         setCurrentStep((prev) => prev - 1)
      }
   }

   return (
      <>
         {steps.length > 1 && (
            <Box mb={2} mt={10}>
               <SignupStepper steps={steps} currentStep={currentStep} />
            </Box>
         )}

         <MultiStepWrapper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
         />

         <Grid container alignItems="center" mt={10}>
            <Grid item xs={6}>
               <Typography variant="body2" color="textSecondary">
                  Step {currentStep + 1} of {steps.length}
               </Typography>
            </Grid>
            <Grid item style={{ textAlign: "right" }} xs={6}>
               {!isFirstStep && <Button onClick={handlePrevious}>Back</Button>}

               <LoadingButton
                  variant="contained"
                  onClick={handleContinue}
                  data-testid={"user-personalise-continue-button"}
                  loading={isLoadingRedirectPage}
               >
                  {isLastStep ? "Finalise" : "Continue"}
               </LoadingButton>
            </Grid>
         </Grid>
      </>
   )
}

export default PersonaliseSteps
