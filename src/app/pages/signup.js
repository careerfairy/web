import React, { Fragment, useState, useEffect, useContext } from "react";
import { useFirebase, withFirebase } from "context/firebase";
import TheatersRoundedIcon from "@material-ui/icons/TheatersRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import BusinessCenterRoundedIcon from "@material-ui/icons/BusinessCenterRounded";
import { useRouter } from "next/router";

import Link from "next/link";
import { Formik } from "formik";
import axios from "axios";
import {
   FormControl,
   Link as MuiLink,
   MenuItem,
   Select,
} from "@material-ui/core";

import Head from "next/head";
import {
   Box,
   CircularProgress,
   Grid,
   Paper,
   TextField,
   Collapse,
   FormControlLabel,
   Container,
   Button,
   Checkbox,
   FormHelperText,
   Typography,
   Stepper,
   Step,
   StepLabel,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TealBackground } from "../materialUI/GlobalBackground/GlobalBackGround";
import GroupProvider from "../components/views/signup/GroupProvider";
import UniversitySelector from "../components/views/universitySelect/UniversitySelector";
import UniversityCountrySelector from "../components/views/universitySelect/UniversityCountrySelector";
import { useAuth } from "../HOCs/AuthProvider";
import { firebaseConnect } from "react-redux-firebase";

const useStyles = makeStyles((theme) => ({
   paper: {
      marginTop: theme.spacing(8),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
   },
   box: {
      width: "100%", // Fix IE 11 issue.
      backgroundColor: "white",
      marginTop: theme.spacing(3),
      borderRadius: 5,
   },
   submit: {
      margin: theme.spacing(3, 0, 2),
   },
   resetEmail: {
      margin: "20px auto 0 auto",
      textAlign: "center",
   },
   footer: {
      color: "white",
      fontWeight: "700",
      fontSize: "1.3em",
      margin: "40px 0 30px 0",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: "0.4em",
   },
   title: {
      color: "white",
      fontWeight: "500",
      fontSize: "2em",
      margin: "40px 0 30px 0",
      textAlign: "center",
   },
   icon: {
      margin: "0 10px",
      color: "white",
   },
   helperText: {
      position: "absolute",
      bottom: -19,
   },
}));

function getSteps(absolutePath) {
   return absolutePath
      ? ["Credentials", "Email Verification"]
      : ["Credentials", "Email Verification", "Join Groups"];
}

function SignUpPage() {
   const classes = useStyles();
   const router = useRouter();
   const { absolutePath } = router.query;
   const { authenticatedUser: user, userData } = useAuth();
   const steps = getSteps(absolutePath);

   const [emailVerificationSent, setEmailVerificationSent] = useState(false);
   const [activeStep, setActiveStep] = useState(0);

   useEffect(() => {
      verifyUserState();
   }, [user.emailVerified, userData?.userEmail]);

   const verifyUserState = async () => {
      if (user.isLoaded && !user.isEmpty) {
         if (user.emailVerified && userData && userData.groupIds) {
            router.push("/next-livestreams");
         } else if (!user.emailVerified) {
            setActiveStep(1);
         }
      }
   };

   function getStepContent(stepIndex) {
      switch (stepIndex) {
         case 0:
            return (
               <SignUpForm
                  user={user}
                  userData={userData}
                  emailVerificationSent={emailVerificationSent}
                  setActiveStep={setActiveStep}
                  setEmailVerificationSent={(bool) =>
                     setEmailVerificationSent(bool)
                  }
               />
            );
         case 1:
            return (
               <SignUpFormSent
                  user={user}
                  userData={userData}
                  absolutePath={absolutePath}
                  setActiveStep={setActiveStep}
                  emailVerificationSent={emailVerificationSent}
               />
            );
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
                     <img
                        alt="logo"
                        src="/logo_white.png"
                        style={{
                           width: "150px",
                           margin: "20px",
                           display: "inline-block",
                        }}
                     />
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

export default SignUpPage;

const SignUpForm = withFirebase(SignUpFormBase);

const SignUpFormSent = firebaseConnect()(SignUpFormValidate);

function SignUpFormBase({ firebase, setEmailVerificationSent, setActiveStep }) {
   const classes = useStyles();
   const {
      query: { absolutePath },
   } = useRouter();

   const [emailSent, setEmailSent] = useState(false);
   const [errorMessage, setErrorMessage] = useState(null);
   const [generalLoading, setGeneralLoading] = useState(false);
   const [open, setOpen] = React.useState(false);

   const submitting = (isSubmitting) => {
      return isSubmitting || emailSent || generalLoading;
   };

   const handleClose = () => {
      setOpen(false);
   };

   const handleOpen = () => {
      setOpen(true);
   };

   return (
      <Fragment>
         <Formik
            initialValues={{
               firstName: "",
               lastName: "",
               email: "",
               password: "",
               confirmPassword: "",
               agreeTerm: false,
               subscribed: true,
               university: { code: "other", name: "Other" },
               universityCountryCode: "",
            }}
            validate={(values) => {
               let errors = {};
               if (!values.email) {
                  errors.email = "Your email is required";
               } else if (
                  !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
                     values.email
                  )
               ) {
                  errors.email = "Please enter a valid email address";
               }
               if (!values.firstName) {
                  errors.firstName = "Your first name is required";
               } else if (values.firstName.length > 50) {
                  errors.firstName = "Cannot be longer than 50 characters";
               } else if (!/^\D+$/i.test(values.firstName)) {
                  errors.firstName = "Please enter a valid first name";
               }
               if (!values.lastName) {
                  errors.lastName = "Your last name is required";
               } else if (values.lastName.length > 50) {
                  errors.lastName = "Cannot be longer than 50 characters";
               } else if (!/^\D+$/i.test(values.lastName)) {
                  errors.lastName = "Please enter a valid last name";
               }
               if (!values.password) {
                  errors.password = "A password is required";
               } else if (
                  !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/i.test(
                     values.password
                  )
               ) {
                  errors.password =
                     "Your password needs to be at least 6 characters long and contain at least one uppercase character, one lowercase character and one number";
               }
               if (!values.confirmPassword) {
                  errors.confirmPassword = "You need to confirm your password";
               } else if (values.confirmPassword !== values.password) {
                  errors.confirmPassword =
                     "Your password was not confirmed correctly";
               }
               if (!values.agreeTerm) {
                  errors.agreeTerm =
                     "Please agree to our T&C and our Privacy Policy";
               }
               if (!values.universityCountryCode) {
                  errors.universityCountryCode = "Please chose a country code";
               }
               return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
               setErrorMessage(null);
               setEmailSent(false);
               setGeneralLoading(true);
               firebase
                  .createUserInAuthAndFirebase(values)
                  .then(() => {
                     firebase
                        .signInWithEmailAndPassword(
                           values.email,
                           values.password
                        )
                        .then(() => {
                           setEmailVerificationSent(true);
                           setSubmitting(false);
                           setGeneralLoading(false);
                           setActiveStep(1);
                        })
                        .catch(() => {
                           router.push("/login");
                        });
                  })
                  .catch((error) => {
                     setErrorMessage(error);
                     setGeneralLoading(false);
                     setSubmitting(false);
                  });
            }}
         >
            {({
               values,
               errors,
               touched,
               handleChange,
               handleBlur,
               handleSubmit,
               setFieldValue,
               isSubmitting,
               /* and other goodies */
            }) => (
               <form id="signUpForm" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                           <TextField
                              autoComplete="fname"
                              name="firstName"
                              variant="outlined"
                              fullWidth
                              id="firstName"
                              label="First Name"
                              autoFocus
                              inputProps={{ maxLength: 50 }}
                              onBlur={handleBlur}
                              value={values.firstName}
                              disabled={submitting(isSubmitting)}
                              error={Boolean(
                                 errors.firstName &&
                                    touched.firstName &&
                                    errors.firstName
                              )}
                              onChange={handleChange}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.firstName &&
                                    touched.firstName &&
                                    errors.firstName
                              )}
                           >
                              <FormHelperText error>
                                 {errors.firstName}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                           <TextField
                              variant="outlined"
                              fullWidth
                              id="lastName"
                              inputProps={{ maxLength: 50 }}
                              maxLength="50"
                              label="Last Name"
                              name="lastName"
                              autoComplete="lname"
                              onBlur={handleBlur}
                              disabled={submitting(isSubmitting)}
                              value={values.lastName}
                              error={Boolean(
                                 errors.lastName &&
                                    touched.lastName &&
                                    errors.lastName
                              )}
                              onChange={handleChange}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.lastName &&
                                    touched.lastName &&
                                    errors.lastName
                              )}
                           >
                              <FormHelperText error>
                                 {errors.lastName}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12}>
                        <FormControl fullWidth>
                           <TextField
                              variant="outlined"
                              fullWidth
                              error={Boolean(errors.email && touched.email)}
                              autoComplete="email"
                              id="emailInput"
                              name="email"
                              placeholder="Email"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.email}
                              disabled={submitting(isSubmitting)}
                              label="Email Address"
                           />
                           <Collapse
                              in={Boolean(
                                 errors.email && touched.email && errors.email
                              )}
                           >
                              <FormHelperText error>
                                 {errors.email}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <UniversityCountrySelector
                           value={values.universityCountryCode}
                           handleClose={handleClose}
                           submitting={submitting(isSubmitting)}
                           setFieldValue={setFieldValue}
                           error={
                              errors.universityCountryCode &&
                              touched.universityCountryCode &&
                              errors.universityCountryCode
                           }
                           handleOpen={handleOpen}
                           handleBlur={handleBlur}
                           open={open}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <UniversitySelector
                           handleBlur={handleBlur}
                           error={
                              errors.university &&
                              touched.university &&
                              errors.university
                           }
                           universityCountryCode={values.universityCountryCode}
                           values={values}
                           submitting={submitting(isSubmitting)}
                           setFieldValue={setFieldValue}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                           <TextField
                              variant="outlined"
                              fullWidth
                              label="Password"
                              id="password"
                              autoComplete="current-password"
                              type="password"
                              name="password"
                              error={Boolean(
                                 errors.password &&
                                    touched.password &&
                                    errors.password
                              )}
                              placeholder="Password"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.password}
                              disabled={submitting(isSubmitting)}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.password &&
                                    touched.password &&
                                    errors.password
                              )}
                           >
                              <FormHelperText error>
                                 {errors.password}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                           <TextField
                              variant="outlined"
                              fullWidth
                              label="Confirm Password"
                              autoComplete="current-password"
                              id="confirmPasswordInput"
                              type="password"
                              error={Boolean(
                                 errors.confirmPassword &&
                                    touched.confirmPassword &&
                                    errors.confirmPassword
                              )}
                              name="confirmPassword"
                              placeholder="Confirm Password"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.confirmPassword}
                              disabled={submitting(isSubmitting)}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.confirmPassword &&
                                    touched.confirmPassword &&
                                    errors.confirmPassword
                              )}
                           >
                              <FormHelperText error>
                                 {errors.confirmPassword}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12}>
                        <FormControlLabel
                           control={
                              <Checkbox
                                 name="agreeTerm"
                                 placeholder="Confirm Password"
                                 onChange={handleChange}
                                 onBlur={handleBlur}
                                 checked={values.agreeTerm}
                                 disabled={submitting(isSubmitting)}
                                 color="primary"
                              />
                           }
                           label={
                              <Typography style={{ fontSize: 12 }}>
                                 I agree to the{" "}
                                 <Link href="/terms">
                                    <a>Terms & Conditions</a>
                                 </Link>{" "}
                                 and I have taken note of the{" "}
                                 <Link href="/privacy">
                                    <a>Data Protection Notice</a>
                                 </Link>
                              </Typography>
                           }
                        />
                        <Collapse
                           in={Boolean(
                              errors.agreeTerm &&
                                 touched.agreeTerm &&
                                 errors.agreeTerm
                           )}
                        >
                           <FormHelperText error>
                              {errors.agreeTerm}
                           </FormHelperText>
                        </Collapse>
                     </Grid>
                     <Grid item xs={12}>
                        <FormControlLabel
                           control={
                              <Checkbox
                                 name="subscribed"
                                 onChange={handleChange}
                                 onBlur={handleBlur}
                                 defaultValue={true}
                                 checked={values.subscribed}
                                 disabled={submitting(isSubmitting)}
                                 color="primary"
                              />
                           }
                           label={
                              <Typography style={{ fontSize: 12 }}>
                                 I don’t want to miss out on events from
                                 exciting companies and would like to receive
                                 occasional email announcements from
                                 CareerFairy. 🚀
                              </Typography>
                           }
                        />
                     </Grid>
                  </Grid>
                  <Button
                     type="submit"
                     fullWidth
                     size="large"
                     variant="contained"
                     color="primary"
                     disabled={isSubmitting || emailSent}
                     endIcon={
                        (isSubmitting || generalLoading) && (
                           <CircularProgress size={20} color="inherit" />
                        )
                     }
                     className={classes.submit}
                  >
                     Sign up
                  </Button>
                  <div className={classes.resetEmail}>
                     <div style={{ marginBottom: "5px" }}>
                        Already part of the family?
                     </div>
                     <Link
                        href={
                           absolutePath
                              ? {
                                   pathname: "/login",
                                   query: { absolutePath },
                                }
                              : "/login"
                        }
                     >
                        <a href="#">Log in</a>
                     </Link>
                  </div>
                  <div className={classes.resetEmail}>
                     <div style={{ marginBottom: "5px" }}>
                        Having issues signing up?
                        <a
                           style={{ marginLeft: "5px" }}
                           href="mailto:maximilian@careerfairy.io"
                        >
                           Let us know
                        </a>
                     </div>
                  </div>
                  <FormHelperText error hidden={!errorMessage}>
                     {errorMessage?.message}
                  </FormHelperText>
               </form>
            )}
         </Formik>
      </Fragment>
   );
}

function SignUpFormValidate({
   user,
   firebase: { reloadAuth },
   setEmailVerificationSent,
   setActiveStep,
}) {
   const {
      push,
      query: { absolutePath },
   } = useRouter();
   const firebase = useFirebase();
   const [errorMessageShown] = useState(false);
   const [incorrectPin, setIncorrectPin] = useState(false);
   const [generalLoading, setGeneralLoading] = useState(false);

   function resendVerificationEmail() {
      setGeneralLoading(true);
      axios({
         method: "post",
         url:
            "https://us-central1-careerfairy-e1fd9.cloudfunctions.net/resendPostmarkEmailVerificationEmailWithPin",
         data: {
            recipientEmail: user.email,
         },
      })
         .then((response) => {
            setIncorrectPin(false);
            setEmailVerificationSent(true);
            setGeneralLoading(false);
         })
         .catch((error) => {
            setIncorrectPin(false);
            setGeneralLoading(false);
         });
   }

   const updateActiveStep = (nextStep) => {
      setTimeout(() => {
         setActiveStep(nextStep);
      }, 500);
   };

   return (
      <Fragment>
         <Formik
            initialValues={{ pinCode: "" }}
            validate={(values) => {
               let errors = {};
               if (!values.pinCode) {
                  errors.pinCode = "A PIN code is required";
               } else if (!/^[0-9]{4}$/.test(values.pinCode)) {
                  errors.pinCode =
                     "The PIN code must be number between 0 and 9999";
               }
               return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
               setIncorrectPin(false);
               const userInfo = {
                  recipientEmail: user.email,
                  pinCode: parseInt(values.pinCode),
               };
               firebase
                  .validateUserEmailWithPin(userInfo)
                  .then(() => {
                     setTimeout(() => {
                        reloadAuth().then(() => {
                           if (absolutePath) {
                              push(absolutePath);
                           } else {
                              updateActiveStep(2);
                           }
                        });
                     }, 200);
                  })
                  .catch((error) => {
                     console.log("error", error);
                     setIncorrectPin(true);
                     setGeneralLoading(false);
                     setSubmitting(false);
                     return;
                  });
            }}
         >
            {({
               values,
               errors,
               touched,
               handleChange,
               handleBlur,
               handleSubmit,
               setFieldValue,
               isSubmitting,
               /* and other goodies */
            }) => (
               <form id="signUpForm" onSubmit={handleSubmit}>
                  <Paper
                     elevation={3}
                     style={{
                        color: "#2c662d",
                        padding: "1rem",
                        backgroundColor: "#fcfff5",
                        marginBottom: "0.5rem",
                     }}
                  >
                     <Typography variant="h6" gutterBottom>
                        Check your mailbox!
                     </Typography>
                     <p>
                        We have just sent you an email containing a 4-digit PIN
                        code. Please enter this code below to start your journey
                        on CareerFairy.{" "}
                        <MuiLink
                           style={{ cursor: "pointer" }}
                           underline="always"
                           onClick={() => resendVerificationEmail()}
                        >
                           Resend the email verification link. to{" "}
                           <strong>{user.email}</strong>
                        </MuiLink>
                     </p>
                  </Paper>
                  <Box style={{ margin: "1rem 0" }}>
                     <TextField
                        label="PIN Code"
                        placeholder="Enter the pin code"
                        variant="outlined"
                        id="pinCode"
                        name="pinCode"
                        fullWidth
                        inputProps={{ maxLength: 4 }}
                        disabled={isSubmitting || generalLoading}
                        value={values.pinCode}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(
                           errors.pinCode && touched.pinCode && errors.pinCode
                        )}
                        helperText={
                           errors.pinCode && touched.pinCode && errors.pinCode
                        }
                     />
                  </Box>
                  <Button
                     size="large"
                     type="submit"
                     fullWidth
                     color="primary"
                     variant="contained"
                     disabled={isSubmitting || generalLoading}
                     endIcon={
                        (isSubmitting || generalLoading) && (
                           <CircularProgress color="inherit" size={20} />
                        )
                     }
                  >
                     {isSubmitting
                        ? "Checking"
                        : generalLoading
                        ? "Resending"
                        : "Validate Email"}
                  </Button>
                  <Typography
                     style={{ marginTop: "0.5rem" }}
                     align="center"
                     hidden={!incorrectPin}
                     color="error"
                     margin="dense"
                  >
                     <strong>Incorrect PIN</strong> <br />
                     The PIN code you entered appears to be incorrect.{" "}
                     <MuiLink
                        href="#"
                        onClick={() => resendVerificationEmail()}
                     >
                        <br />
                        Resend the verification email.
                     </MuiLink>
                  </Typography>
                  <div
                     style={{ margin: "20px auto 0 auto", textAlign: "center" }}
                  >
                     <div style={{ marginBottom: "5px" }}>
                        Having issues signing up?{" "}
                        <MuiLink
                           style={{ cursor: "pointer" }}
                           href="mailto:maximilian@careerfairy.io"
                        >
                           {" "}
                           Let us know
                        </MuiLink>
                     </div>
                  </div>
                  <Typography
                     align="center"
                     color="error"
                     hidden={!errorMessageShown}
                  >
                     An error occurred while creating to your account
                  </Typography>
               </form>
            )}
         </Formik>
      </Fragment>
   );
}
