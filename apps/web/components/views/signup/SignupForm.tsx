import Head from "next/head"
import { PillsBackground } from "../../../materialUI/GlobalBackground/GlobalBackGround"
import { HeaderLogoWrapper } from "../../../materialUI"
import { MainLogo } from "../../logos"
import { Box, Button, Container, Grid, Typography } from "@mui/material"
import React, { useCallback, useEffect, useMemo, useState } from "react"
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
import SignUpAdminForm from "./steps/SignUpAdminForm"

const styles = sxStyles({
   icon: {
      margin: "0 10px",
      color: "white",
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

const stepsMap = new Map<string, MultiStepComponentType>([
   [
      "Credentials",
      {
         component: () => SignUpUserForm,
         description: "Credentials",
         title: "Create your profile to start",
      },
   ],
   [
      "Admin Credentials",
      {
         component: () => SignUpAdminForm,
         description: "Admin Credentials",
         title: "Create your admin profile to start",
      },
   ],
   [
      "Pin",
      {
         component: () => SignUpPinForm,
         description: "Email Verification",
         title: "Create your profile to start",
      },
   ],
   [
      "Social",

      {
         component: () => SocialInformation,
         description: "Social",
         title: "Before we kick off...",
      },
   ],
   [
      "Location",
      {
         component: () => LocationInformation,
         description: "Location",
         title: "Before we kick off...",
      },
   ],
   [
      "Interests",
      {
         component: () => InterestsInformation,
         description: "Interests",
         title: "Additional Information",
         subTitle:
            "To help us pick the best events for you, tell us more about your interests",
      },
   ],
])

type SignupFormProps = {
   groupAdmin?: boolean
}
const SignupForm = ({ groupAdmin }: SignupFormProps) => {
   const fallbackSignupRedirectPath = groupAdmin ? "/profile/groups" : "/portal"

   const steps: MultiStepComponentType[] = useMemo(
      () =>
         groupAdmin
            ? [stepsMap.get("Admin Credentials")]
            : [
                 stepsMap.get("Credentials"),
                 stepsMap.get("Pin"),
                 stepsMap.get("Social"),
                 stepsMap.get("Location"),
                 stepsMap.get("Interests"),
              ],
      [groupAdmin]
   )
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
         goToSocialStep()
      }
   }, [userData, currentStep])

   useEffect(() => {
      if (!user.isLoaded || user.isEmpty) return

      if (
         firebase.auth?.currentUser &&
         !firebase.auth.currentUser.emailVerified
      ) {
         return goToEmailVerificationStep()
      }
   }, [user, firebase.auth?.currentUser?.emailVerified])

   const handlePrevious = () => {
      if (!isFirstStep) {
         setCurrentStep((prev) => prev - 1)
      }
   }

   const goToEmailVerificationStep = () => {
      const index = steps.findIndex(
         (step) => step.description === stepsMap.get("Pin").description
      )
      if (index > -1) {
         setCurrentStep(index)
      }
   }

   const goToSocialStep = () => {
      const index = steps.findIndex(
         (step) => step.description === stepsMap.get("Social").description
      )
      if (index > -1) {
         setCurrentStep(index)
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
      <>
         {renderTitle(steps[currentStep])}
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
