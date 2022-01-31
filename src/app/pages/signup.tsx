import React, { Fragment, useState, useEffect } from "react";
import TheatersRoundedIcon from "@material-ui/icons/TheatersRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import BusinessCenterRoundedIcon from "@material-ui/icons/BusinessCenterRounded";
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
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TealBackground } from "../materialUI/GlobalBackground/GlobalBackGround";
import GroupProvider from "../components/views/signup/GroupProvider";
import { useAuth } from "../HOCs/AuthProvider";
import {createStyles} from "@material-ui/styles";
import SignUpPinForm from "../components/views/signup/SignUpPinForm";
import SignUpUserForm from "../components/views/signup/SignUpUserForm";

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

function SignUpPage() {
   const classes = useStyles();
   const router = useRouter();
   const { absolutePath } = router.query;
   const { authenticatedUser: user, userData } = useAuth();
   const steps = getSteps(absolutePath);

   const [activeStep, setActiveStep] = useState(0);

   useEffect(() => {
      verifyUserState();
   }, [user.emailVerified, userData?.userEmail]);

   const verifyUserState = () => {
      if (user.isLoaded && !user.isEmpty) {
         if (user.emailVerified && userData && userData.groupIds) {
            void router.push("/next-livestreams");
         } else if (!user.emailVerified) {
            setActiveStep(1);
         }
      }
   };

   function getStepContent(stepIndex) {
      switch (stepIndex) {
         case 0:
            return <SignUpUserForm setActiveStep={setActiveStep} />;
         case 1:
            return <SignUpPinForm user={user} setActiveStep={setActiveStep} />;
         case 2:
            return <GroupProvider absolutePath={absolutePath} />;
         default:
            return setActiveStep(0);
      }
   }

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
               <TheatersRoundedIcon className={classes.icon} fontSize="large" />
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
                     style={{ padding: "0 0 24px 0" }}
                     activeStep={activeStep}
                     alternativeLabel
                  >
                     {steps.map((label) => (
                        <Step key={label}>
                           <StepLabel>{label}</StepLabel>
                        </Step>
                     ))}
                  </Stepper>
                  {getStepContent(activeStep)}
               </Box>
            </Container>
            <Typography className={classes.footer}>Meet Your Future</Typography>
         </TealBackground>
      </Fragment>
   );
}

function getSteps(absolutePath) {
   const steps = ["Credentials", "Email Verification", "Join Groups"];
   return absolutePath ? steps.slice(0, 2) : steps
}

export default SignUpPage;
