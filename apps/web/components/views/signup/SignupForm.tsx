import { Box, Button, Container, Grid, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import MultiStepWrapper, {
   MultiStepComponentType,
} from "../common/MultiStepWrapper"
import SignUpUserForm from "./steps/SignUpUserForm"
import SignUpPinForm from "./steps/SignUpPinForm"
import SocialInformation from "./steps/SocialInformation"
import LocationInformation from "./steps/LocationInformation"
import InterestsInformation from "./steps/InterestsInformation"
import { sxStyles } from "../../../types/commonTypes"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import { userRepo } from "../../../data/RepositoryInstances"
import LoadingButton from "@mui/lab/LoadingButton"
import GenericStepper from "../common/GenericStepper"
import { dataLayerEvent } from "../../../util/analyticsUtils"

const styles = sxStyles({
   icon: {
      margin: "0 10px",
      color: "white",
   },
   headerWrapper: {
      marginBottom: 4,
      textAlign: "center",
      px: 2,
   },
   title: {
      fontFamily: "Poppins",
      fontWeight: 400,
      fontSize: "46px",
      lineHeight: "63px",
      textAlign: "center",
      letterSpacing: "-0.02em",
      marginTop: 6,
   },
   subtitle: {
      fontSize: "1.1rem",
      fontWeight: 400,
      lineHeight: "29px",
      letterSpacing: "-0.02em",
   },
})

export const RenderTitle = ({
   title,
   subTitle,
}: {
   title: string
   subTitle?: string
}) => {
   return (
      <Grid sx={styles.headerWrapper}>
         <Typography sx={styles.title}>{title}</Typography>
         {subTitle ? (
            <Typography sx={styles.subtitle}>{subTitle}</Typography>
         ) : null}
      </Grid>
   )
}

const steps: MultiStepComponentType[] = [
   {
      component: () => SignUpUserForm,
      description: "Credentials",
      title: "Create your profile to start",
   },
   {
      component: () => SignUpPinForm,
      description: "Email Verification",
      title: "Create your profile to start",
   },
   {
      component: () => SocialInformation,
      description: "Social",
      title: "Before we kick off...",
   },
   {
      component: () => LocationInformation,
      description: "Location",
      title: "Before we kick off...",
   },
   {
      component: () => InterestsInformation,
      description: "Interests",
      title: "Additional Information",
      subTitle:
         "To help us pick the best events for you, tell us more about your interests",
   },
]

const fallbackSignupRedirectPath = "/portal"

const SignupForm = () => {
   const { authenticatedUser: user, userData } = useAuth()
   const {
      push,
      query: { absolutePath },
   } = useRouter()
   const firebase = useFirebaseService()

   const [isLoadingRedirectPage, setIsLoadingRedirectPage] = useState(false)
   const [currentStep, setCurrentStep] = useState(0)
   const isLastStep = currentStep === steps.length - 1
   const totalSteps = steps.length - 2
   const isFirstStep = currentStep === 0
   const showBackButton = currentStep > 2
   const shouldUpdateStepAnalytics = currentStep > 1

   useEffect(() => {
      if (userData && currentStep === 0) {
         setCurrentStep(2)
      }
   }, [userData, currentStep])

   useEffect(() => {
      if (!user.isLoaded || user.isEmpty) return

      if (
         firebase.auth?.currentUser &&
         !firebase.auth.currentUser.emailVerified
      ) {
         return setCurrentStep(1)
      }
   }, [user, firebase.auth?.currentUser?.emailVerified])

   const handlePrevious = () => {
      if (!isFirstStep) {
         setCurrentStep((prev) => prev - 1)
      }
   }

   const updateAnalytics = useCallback(
      async (stepId: string, totalSteps: number) => {
         const { userEmail } = userData
         try {
            await userRepo.setRegistrationStepStatus(
               userEmail,
               stepId,
               totalSteps
            )
         } catch (error) {
            console.log(error)
         }
      },
      [userData]
   )

   useEffect(() => {
      if (shouldUpdateStepAnalytics) {
         const { description: stepId } = steps[currentStep]

         updateAnalytics(stepId, totalSteps).catch(console.error)
      }
   }, [currentStep])

   const handleContinue = () => {
      if (isLastStep) {
         // set a loading state in the Finalise button, the next page may take some seconds to render
         setIsLoadingRedirectPage(true)

         if (absolutePath) {
            void push(absolutePath as any)
         } else {
            void push(fallbackSignupRedirectPath)
         }

         dataLayerEvent("signup_complete_redirect")
      } else {
         setCurrentStep((prev) => prev + 1)
      }
   }

   const renderContinueAndBackButtons = () => (
      <Grid
         container
         alignItems="center"
         mt={{
            xs: 5,
            md: 10,
         }}
      >
         <Grid item style={{ textAlign: "right" }} xs={12}>
            {showBackButton ? (
               <Button
                  data-testid={"user-registration-back-button"}
                  onClick={handlePrevious}
               >
                  Back
               </Button>
            ) : null}

            <LoadingButton
               variant="contained"
               onClick={handleContinue}
               data-testid={"user-registration-continue-button"}
               loading={isLoadingRedirectPage}
            >
               {isLastStep ? "Finalise" : "Continue"}
            </LoadingButton>
         </Grid>
      </Grid>
   )

   return (
      <>
         <RenderTitle
            title={steps[currentStep].title}
            subTitle={steps[currentStep].subTitle}
         />
         <Container maxWidth="md">
            <Box data-testid={"signup-page-form"} p={3} mt={3}>
               <Box mb={4}>
                  <GenericStepper steps={steps} currentStep={currentStep} />
               </Box>
               <MultiStepWrapper
                  steps={steps}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
               />
               {currentStep > 1 && renderContinueAndBackButtons()}
            </Box>
         </Container>
      </>
   )
}

export default SignupForm
