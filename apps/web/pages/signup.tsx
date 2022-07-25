import React, { useState, useEffect, useCallback } from "react"
import Head from "next/head"
import { Box, Button, Container, Grid, Typography } from "@mui/material"
import { RegistrationBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import { useAuth } from "../HOCs/AuthProvider"
import SignUpPinForm from "../components/views/signup/steps/SignUpPinForm"
import SignUpUserForm from "../components/views/signup/steps/SignUpUserForm"
import MultiStepWrapper, {
   MultiStepComponentType,
} from "../components/views/common/MultiStepWrapper"
import { MainLogo } from "./../components/logos"
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext"
import { sxStyles } from "../types/commonTypes"
import { HeaderLogoWrapper } from "../materialUI"
import GenericStepper from "../components/views/common/GenericStepper"
import SocialInformation from "../components/views/signup/steps/SocialInformation"
import LocationInformation from "../components/views/signup/steps/LocationInformation"
import LoadingButton from "@mui/lab/LoadingButton"
import { useRouter } from "next/router"
import InterestsInformation from "../components/views/signup/steps/InterestsInformation"
import { userRepo } from "../data/RepositoryInstances"

export const SIGNUP_REDIRECT_PATH = "/portal"

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

const SignUp = () => {
   const { authenticatedUser: user, userData } = useAuth()
   const {
      push,
      query: { absolutePath },
   } = useRouter()
   const firebase = useFirebaseService()

   const [isLoadingRedirectPage, setIsLoadingRedirectPage] = useState(false)
   const [currentStep, setCurrentStep] = useState(0)
   const [stepAnalytics, setStepAnalytics] = useState([])
   const isLastStep = currentStep === steps.length - 1
   const totalSteps = steps.length - 2
   const isFirstStep = currentStep === 0
   const showBackButton = currentStep > 2
   const shouldUpdateStepAnalytics = currentStep > 1

   useEffect(() => {
      if (userData && currentStep === 0) {
         setCurrentStep(2)
      }
   }, [userData])

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
            await userRepo.setRegistrationStepStatus({
               userEmail,
               stepId,
               totalSteps,
            })
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
            {showBackButton && (
               <Button
                  data-testid={"user-registration-back-button"}
                  onClick={handlePrevious}
               >
                  Back
               </Button>
            )}

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
   headerWrapper: {
      marginBottom: 4,
      textAlign: "center",
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

const renderTitle = (step: MultiStepComponentType) => {
   const { title, subTitle } = step
   return (
      <Grid sx={styles.headerWrapper}>
         <Typography sx={styles.title}>{title}</Typography>
         {subTitle ? (
            <Typography sx={styles.subtitle}>{subTitle}</Typography>
         ) : null}
      </Grid>
   )
}

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

            {renderTitle(steps[currentStep])}

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
