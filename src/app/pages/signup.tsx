import React, { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
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
import { TealBackground } from "../materialUI/GlobalBackground/GlobalBackGround";
import { useAuth } from "../HOCs/AuthProvider";
import { createStyles } from '@mui/styles';
import SignUpPinForm from "../components/views/signup/SignUpPinForm";
import SignUpUserForm from "../components/views/signup/SignUpUserForm";
import MultiStepWrapper, {
  MultiStepComponentType,
} from "../components/views/signup/MultiStepWrapper";
import PersonaliseSteps from "../components/views/signup/PersonaliseSteps";
import {MainLogo} from './../components/logos'

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
    component: () => PersonaliseSteps,
    // Change this to "Personalise" when we have multiple steps
    description: "Join Groups",
  }
]

const SignUp = () => {
  const {authenticatedUser: user, userData} = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(initialStates)
  const {query: {absolutePath}} = useRouter();

  useEffect(() => {
    // When redirecting, we want to skip the last step
    if(absolutePath && steps.length === 3) {
      setSteps(prevSteps => prevSteps.slice(0, 2))
    }
  }, [steps, absolutePath])

  useEffect(() => {
    if (!user.isLoaded || user.isEmpty) return

    console.log("useEffect signup", user)
    if (!user.emailVerified) {
      return setCurrentStep(1);
    }
  }, [user])

  return (
    <SignUpPageLayout>
      <Stepper
        style={{padding: "0 0 24px 0"}}
        activeStep={currentStep}
        alternativeLabel
      >
        {steps.map((step, i) => (
          <Step key={i}>
            <StepLabel>{step.description}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <MultiStepWrapper steps={steps} currentStep={currentStep}
                        setCurrentStep={setCurrentStep}/>
    </SignUpPageLayout>

  )
}

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
          <Link href="/">
            <a>
              <MainLogo className={classes.logo} white={true} />
            </a>
          </Link>
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
