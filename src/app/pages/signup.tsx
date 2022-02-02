import React, { Fragment, useState, useEffect } from "react";
import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
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
    <PageLayout steps={steps} currentStep={currentStep}>
      <MultiStepWrapper steps={steps} currentStep={currentStep}
                        setCurrentStep={setCurrentStep}/>
    </PageLayout>

  )
}

const useStyles = makeStyles((theme) => createStyles({
  box: {
    width: "100%", // Fix IE 11 issue.
    backgroundColor: "white",
    marginTop: theme.spacing(3),
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
    margin: "40px 0 30px 0",
    textAlign: "center",
  },
  icon: {
    margin: "0 10px",
    color: "white",
  }
}));

const PageLayout = ({steps, currentStep, children}) => {
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
              <img alt="logo" src="/logo_white.png" style={{
                width: "150px",
                margin: "20px",
                display: "inline-block",
              }}/>
            </a>
          </Link>
        </header>
        <Box display="flex" justifyContent="center">
          <TheatersRoundedIcon className={classes.icon} fontSize="large"/>
          <ArrowForwardIosRoundedIcon
            className={classes.icon}
            fontSize="large"
          />
          <BusinessCenterRoundedIcon
            className={classes.icon}
            fontSize="large"
          />
        </Box>
        <Typography className={classes.title}>Sign Up</Typography>
        <Container maxWidth="sm">
          <Box boxShadow={1} p={3} className={classes.box}>
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
            {children}
          </Box>
        </Container>
        <Typography className={classes.footer}>Meet Your Future</Typography>
      </TealBackground>
    </Fragment>
  )
}

export default SignUp
