import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { Box, Container, Typography } from "@mui/material"
import { RegistrationBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import { useAuth } from "../HOCs/AuthProvider"
import SignUpPinForm from "../components/views/signup/SignUpPinForm"
import SignUpUserForm from "../components/views/signup/SignUpUserForm"
import MultiStepWrapper, {
   MultiStepComponentType,
} from "../components/views/common/MultiStepWrapper"
import PersonaliseSteps from "../components/views/signup/personaliseInformation/PersonaliseSteps"
import { MainLogo } from "./../components/logos"
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext"
import { sxStyles } from "../types/commonTypes"
import { HeaderLogoWrapper } from "../materialUI"
import GenericStepper from "../components/views/common/GenericStepper"

export const SIGNUP_REDIRECT_PATH = "/portal"

const initialStates: MultiStepComponentType[] = [
   {
      component: () => SignUpUserForm,
      description: "Credentials",
   },
   {
      component: () => SignUpPinForm,
      description: "Email Verification",
   },
   {
      component: () => PersonaliseSteps, // contains multiple steps
      description: "Personalise",
   },
]

const SignUp = () => {
   const { authenticatedUser: user } = useAuth()
   const firebase = useFirebaseService()

   const [currentStep, setCurrentStep] = useState(0)
   const [steps, setSteps] = useState(initialStates)
   const {
      query: { absolutePath },
   } = useRouter()

   useEffect(() => {
      // When redirecting, we want to skip the Personalise step
      if (absolutePath && steps.length === 3) {
         setSteps((prevSteps) => prevSteps.slice(0, 2))
      }
   }, [steps, absolutePath])

   useEffect(() => {
      if (!user.isLoaded || user.isEmpty) return

      if (
         firebase.auth?.currentUser &&
         !firebase.auth.currentUser.emailVerified
      ) {
         return setCurrentStep(1)
      }
   }, [user, firebase.auth?.currentUser?.emailVerified])

   return (
      <SignUpPageLayout showTitle={currentStep < 2}>
         {currentStep < 2 ? (
            <Box mb={2}>
               <GenericStepper steps={steps} currentStep={currentStep} />
            </Box>
         ) : null}

         <MultiStepWrapper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
         />
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
   title: {
      fontFamily: "Poppins",
      fontWeight: 400,
      fontSize: "46px",
      lineHeight: "63px",
      textAlign: "center",
      letterSpacing: "-0.02em",
      marginTop: 6,
   },
   icon: {
      margin: "0 10px",
      color: "white",
   },
   logo: {
      margin: "20px 20px 0 20px",
   },
})

export const SignUpPageLayout = ({ children, showTitle }) => {
   return (
      <>
         <Head>
            <title key="title">CareerFairy | Sign Up</title>
         </Head>
         <RegistrationBackground>
            <HeaderLogoWrapper>
               <MainLogo sx={styles.logo} />
            </HeaderLogoWrapper>
            {showTitle && (
               <Typography sx={styles.title}>
                  Create your profile to start
               </Typography>
            )}
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
