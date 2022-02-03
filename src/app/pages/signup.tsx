import React, {Fragment, useState, useEffect} from "react";
import {useRouter} from "next/router";
import Head from "next/head";
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import {TealBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import {useAuth} from "../HOCs/AuthProvider";
import {createStyles} from '@mui/styles';
import SignUpPinForm from "../components/views/signup/SignUpPinForm";
import SignUpUserForm from "../components/views/signup/SignUpUserForm";
import MultiStepWrapper, {
  MultiStepComponentType,
} from "../components/views/signup/MultiStepWrapper";
import PersonaliseSteps from "../components/views/signup/PersonaliseSteps";
import {MainLogo} from './../components/logos'

export const SIGNUP_REDIRECT_PATH = "/profile"

const initialStates: MultiStepComponentType[] = [
  {
    component: () => SignUpUserForm,
    description: "Credentials"
  },
  {
    component: () => SignUpPinForm,
    description: "Email Verification"
  },
  {
    component: () => PersonaliseSteps, // contains multiple steps
    description: "Personalise",
  }
]

const SignUp = () => {
  const {authenticatedUser: user} = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(initialStates)
  const {query: {absolutePath}} = useRouter();

  useEffect(() => {
    // When redirecting, we want to skip the Personalise step
    if (absolutePath && steps.length === 3) {
      setSteps(prevSteps => prevSteps.slice(0, 2))
    }
  }, [steps, absolutePath])

  useEffect(() => {
    if (!user.isLoaded || user.isEmpty) return

    if (!user.emailVerified) {
      return setCurrentStep(1);
    }
  }, [user])

  return (
    <SignUpPageLayout>
      {currentStep < 2 ? (
        <Box mb={2}>
          <SignupStepper steps={steps} currentStep={currentStep} />
        </Box>
      ) : null}

      <MultiStepWrapper steps={steps} currentStep={currentStep}
                        setCurrentStep={setCurrentStep}/>
    </SignUpPageLayout>

  )
}

export const SignupStepper = ({
                                currentStep,
                                steps
                              }: { currentStep: number, steps: MultiStepComponentType[] }) => (
  <Stepper
    activeStep={currentStep}
    alternativeLabel
  >
    {steps.map((step, i) => (
      <Step key={i}>
        <StepLabel>{step.description}</StepLabel>
      </Step>
    ))}
  </Stepper>
)

const useStyles = makeStyles((theme) => createStyles({
  box: {
    width: "100%", // Fix IE 11 issue.
    backgroundColor: "white",
    marginTop: theme.spacing(1),
    borderRadius: 5,
  },
  footer: {
    color: "white",
    fontWeight: 700,
    fontSize: "1.3em",
    margin: "40px 0 30px 0",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "0.4em",
  },
  title: {
    color: "white",
    fontWeight: 500,
    fontSize: "2em",
    textAlign: "center",
  },
  icon: {
    margin: "0 10px",
    color: "white",
  },
  logo: {
    margin: "20px 20px 0 20px"
  }
}));

export const SignUpPageLayout = ({children}) => {
  const classes = useStyles();
  return (
    <Fragment>
      <Head>
        <title key="title">CareerFairy | Sign Up</title>
      </Head>
      <TealBackground>
        <header>
          <MainLogo className={classes.logo} white={true}/>
        </header>
        <Typography className={classes.title}>Sign Up</Typography>
        <Container maxWidth="sm">
          <Box boxShadow={1} p={3} className={classes.box}>
            {children}
          </Box>
        </Container>
        <Typography className={classes.footer}>Meet Your Future</Typography>
      </TealBackground>
    </Fragment>
  )
}

export default SignUp
