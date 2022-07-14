import React, { useState, useEffect, useCallback } from "react"
import Head from "next/head"
import { Box, Button, Container, Grid, Typography } from "@mui/material"
import { RegistrationBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import { useAuth } from "../HOCs/AuthProvider"
import SignUpPinForm, {
   renderSingUpPinTitle,
} from "../components/views/signup/steps/SignUpPinForm"
import SignUpUserForm, {
   renderSignUpUserForm,
} from "../components/views/signup/steps/SignUpUserForm"
import MultiStepWrapper, {
   MultiStepComponentType,
} from "../components/views/common/MultiStepWrapper"
import { MainLogo } from "./../components/logos"
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext"
import { sxStyles } from "../types/commonTypes"
import { HeaderLogoWrapper } from "../materialUI"
import GenericStepper from "../components/views/common/GenericStepper"
import SocialInformation, {
   renderSocialInformationStepTitle,
} from "../components/views/signup/steps/SocialInformation"
import AdditionalInformation, {
   renderAdditionalInformationStepTitle,
} from "../components/views/signup/steps/AdditionalInformation"
import LoadingButton from "@mui/lab/LoadingButton"
import { useRouter } from "next/router"
import InterestsInformation, {
   renderInterestsInformationStepTitle,
} from "../components/views/signup/steps/InterestsInformation"
import userRepo from "../data/firebase/UserRepository"
import { RegistrationStep } from "@careerfairy/shared-lib/dist/users"

export const SIGNUP_REDIRECT_PATH = "/portal"

const steps: MultiStepComponentType[] = [
   {
      component: () => SignUpUserForm,
      description: "Credentials",
      title: renderSignUpUserForm(),
   },
   {
      component: () => SignUpPinForm,
      description: "Email Verification",
      title: renderSingUpPinTitle(),
   },
   {
      component: () => SocialInformation,
      description: "Social",
      title: renderSocialInformationStepTitle(),
   },
   {
      component: () => AdditionalInformation,
      description: "Additional Information",
      title: renderAdditionalInformationStepTitle(),
   },
   {
      component: () => InterestsInformation,
      description: "Interests",
      title: renderInterestsInformationStepTitle(),
   },
]

const SignUp = () => {
   const { authenticatedUser: user, userData } = useAuth()
   const {
      push,
      query: { absolutePath },
   } = useRouter()
   const firebase = useFirebaseService()

   const [isLoadingRedirectPage, setIsLoadingRedirectPage] = useState(false)
   const [currentStep, setCurrentStep] = useState(0)
   const [stepAnalytics, setStepAnalytics] = useState([] as RegistrationStep[])
   const isLastStep = currentStep === steps.length - 1
   const isFirstStep = currentStep === 0
   const showBackButton = currentStep > 2
   const shouldUpdateStepAnalytics = currentStep > 1

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

   useEffect(() => {
      const updateAnalytics = async () => {
         const { userEmail } = userData
         try {
            await userRepo.setRegistrationStepStatus({
               userEmail,
               steps: stepAnalytics,
            })
         } catch (error) {
            console.log(error)
         }
      }

      if (stepAnalytics.length) {
         updateAnalytics().catch(console.error)
      }
   }, [stepAnalytics])

   const updateStepStatus = useCallback(() => {
      if (shouldUpdateStepAnalytics) {
         const { id } = userData
         const { description: stepId } = steps[currentStep]
         const isCurrentStepAlreadyOnStepAnalytics = stepAnalytics.find(
            (step) => step.stepId === stepId
         )

         if (!isCurrentStepAlreadyOnStepAnalytics) {
            const newStepAnalytics = [...stepAnalytics, { userId: id, stepId }]

            setStepAnalytics(newStepAnalytics)
         }
      }
   }, [userData, currentStep])

   const handleContinue = () => {
      updateStepStatus()

      if (isLastStep) {
         // set a loading state in the Finalise button, the next page may take some seconds to render
         setIsLoadingRedirectPage(true)

         if (absolutePath) {
            void push(absolutePath as any)
         } else {
            void push(SIGNUP_REDIRECT_PATH)
         }
      } else {
         setCurrentStep((prev) => prev + 1)
      }
   }

   const renderContinueAndBackButtons = () => (
      <Grid container alignItems="center" mt={10}>
         <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
               Step {currentStep + 1} of {steps.length}
            </Typography>
         </Grid>
         <Grid item style={{ textAlign: "right" }} xs={6}>
            {showBackButton && <Button onClick={handlePrevious}>Back</Button>}

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
   )

   return (
      <SignUpPageLayout currentStep={currentStep}>
         <Box mb={4}>
            <GenericStepper steps={steps} currentStep={currentStep} />
         </Box>

         <MultiStepWrapper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
         />

         {currentStep > 1 && renderContinueAndBackButtons()}
      </SignUpPageLayout>
   )
}

const styles = sxStyles({
   footer: {
      fontWeight: 700,
      fontSize: "1.3em",
      margin: "40px 0 30px 0",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: "0.4em",
   },
   icon: {
      margin: "0 10px",
      color: "white",
   },
   logo: {
      margin: "20px 20px 0 20px",
   },
})

export const SignUpPageLayout = ({ children, currentStep }) => {
   return (
      <>
         <Head>
            <title key="title">CareerFairy | Sign Up</title>
         </Head>
         <RegistrationBackground>
            <HeaderLogoWrapper>
               <MainLogo sx={styles.logo} />
            </HeaderLogoWrapper>

            {steps[currentStep].title || null}

            <Container maxWidth="md">
               <Box data-testid={"signup-page-form"} p={3} mt={3}>
                  {children}
               </Box>
            </Container>
            <Typography sx={styles.footer}>Meet Your Future</Typography>
         </RegistrationBackground>
      </>
   )
}

export default SignUp
