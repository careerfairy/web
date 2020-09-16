import React, {Fragment, useState, useEffect} from 'react';
import {Form, Image, Message} from "semantic-ui-react";
import {withFirebase} from "../data/firebase";
import TheatersRoundedIcon from '@material-ui/icons/TheatersRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import BusinessCenterRoundedIcon from '@material-ui/icons/BusinessCenterRounded';

import {useRouter} from 'next/router';
import Link from 'next/link';
import {Formik} from 'formik';
import axios from 'axios';

import Head from 'next/head';
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import {
    Box,
    CircularProgress,
    Grid,
    TextField,
    FormControlLabel,
    Container,
    Button,
    Checkbox,
    FormHelperText, Typography
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {TealBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import GroupProvider from "../components/views/signup/GroupProvider";

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    box: {
        width: '100%', // Fix IE 11 issue.
        backgroundColor: "white",
        marginTop: theme.spacing(3),
        borderRadius: 5
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    resetEmail: {
        margin: "20px auto 0 auto",
        textAlign: "center"
    },
    footer: {
        color: 'white',
        fontWeight: '700',
        fontSize: '1.3em',
        margin: '40px 0 30px 0',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.4em'
    },
    title: {
        color: 'white',
        fontWeight: '500',
        fontSize: '2em',
        margin: '40px 0 30px 0',
        textAlign: 'center'
    },
    icon: {
        margin: '0 10px',
        color: 'white'
    }
}));

function getSteps() {
    return ['Credentials', 'Email Verification', 'Join Groups'];
}

function SignUpPage({firebase}) {
    const classes = useStyles()
    const steps = getSteps();
    const router = useRouter();

    const [user, setUser] = useState(false);
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [activeStep, setActiveStep] = useState(0);


    useEffect(() => {
        firebase.auth.onAuthStateChanged(user => {
            if (user && user.emailVerified) {
                router.push('/profile')
            } else if (user && !user.emailVerified) {
                setUser(user);
                setActiveStep(1)
            } else {
                setUser(null);
            }
        })
    }, []);


    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <SignUpForm
                    user={user}
                    emailVerificationSent={emailVerificationSent}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    setActiveStep={setActiveStep}
                    setEmailVerificationSent={(bool) => setEmailVerificationSent(bool)}/>
                    ;
            case 1:
                return <SignUpFormSent
                    user={user}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    handleReset={handleReset}
                    setActiveStep={setActiveStep}
                    activeStep={activeStep}
                    emailVerificationSent={emailVerificationSent}
                    router={router}/>
            case 2:
                return <GroupProvider
                    user={user}
                    handleBack={handleBack}
                    handleReset={handleReset}
                    activeStep={activeStep}
                    router={router}/>
            default:
                return null;
        }
    }


    return (
        <Fragment>
            <Head>
                <title key="title">CareerFairy | Sign Up</title>
            </Head>
            <TealBackground>
                <header>
                    <Link href='/'><a><Image src='/logo_white.png' style={{
                        width: '150px',
                        margin: '20px',
                        display: 'inline-block'
                    }}/></a></Link>
                </header>
                <Box display="flex" justifyContent="center">
                    <TheatersRoundedIcon className={classes.icon} fontSize="large"/>
                    <ArrowForwardIosRoundedIcon className={classes.icon} fontSize="large"/>
                    <BusinessCenterRoundedIcon className={classes.icon} fontSize="large"/>
                </Box>
                <Typography className={classes.title}>
                    Sign Up
                </Typography>
                <Container maxWidth="sm">
                    <Box boxShadow={1} p={3} className={classes.box}>
                        <Stepper style={{padding: "0 0 24px 0"}} activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel color="secondary">{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        {getStepContent(activeStep)}
                    </Box>
                </Container>
                <Typography className={classes.footer}>
                    Meet Your Future
                </Typography>
            </TealBackground>
        </Fragment>
    )
}

export default withFirebase(SignUpPage);

const SignUpForm = withFirebase(SignUpFormBase);

const SignUpFormSent = SignUpFormValidate;

function SignUpFormBase({firebase, user, emailVerificationSent, setEmailVerificationSent, setActiveStep}) {
    const classes = useStyles()

    const [emailSent, setEmailSent] = useState(false);
    const [errorMessageShown, setErrorMessageShown] = useState(false);
    const [generalLoading, setGeneralLoading] = useState(false);
    const [formData, setFormData] = useState({})

    useEffect(() => {
        if (emailSent && user && !emailVerificationSent) {
            axios({
                method: 'post',
                url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendPostmarkEmailVerificationEmailWithPinAndUpdateUserData',
                data: {
                    recipientEmail: user.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                }
            }).then(response => {
                setEmailVerificationSent(true);
                setGeneralLoading(false);
                setActiveStep(1)
            }).catch(error => {
                console.log("error in signup base", error);
                setGeneralLoading(false);
            });
        }
    }, [user, emailSent]);

    return (
        <Fragment>

            <Formik
                initialValues={{
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    agreeTerm: false
                }}
                validate={values => {
                    let errors = {};
                    if (!values.email) {
                        errors.email = 'Your email is required';
                    } else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(values.email)) {
                        errors.email = 'Please enter a valid email address';
                    }
                    if (!values.firstName) {
                        errors.firstName = 'Your first name is required';
                    } else if (values.firstName.length > 50) {
                        errors.firstName = 'Cannot be longer than 50 characters';
                    }
                    if (!values.lastName) {
                        errors.lastName = 'Your last name is required';
                    } else if (values.lastName.length > 50) {
                        errors.lastName = 'Cannot be longer than 50 characters';
                    }
                    if (!values.password) {
                        errors.password = 'A password is required';
                    } else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/i.test(values.password)) {
                        errors.password = 'Your password needs to be at least 6 characters long and contain at least one uppercase character, one lowercase character and one number';
                    }

                    if (!values.confirmPassword) {
                        errors.confirmPassword = 'You need to confirm your password';
                    } else if (values.confirmPassword !== values.password) {
                        errors.confirmPassword = 'Your password was not confirmed correctly';
                    }
                    if (!values.agreeTerm) {
                        errors.agreeTerm = 'Please agree to our T&C and our Privacy Policy';
                    }
                    return errors;
                }}
                onSubmit={(values, {setSubmitting}) => {
                    setFormData(values)
                    setErrorMessageShown(false);
                    setEmailSent(false);
                    setGeneralLoading(true);
                    firebase.createUserWithEmailAndPassword(values.email, values.password)
                        .then(() => {
                            setSubmitting(false);
                            setEmailSent(true);
                        }).catch(error => {
                        setErrorMessageShown(true);
                        setSubmitting(false);
                        setGeneralLoading(false);
                    })
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
                    <form id='signUpForm' onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="fname"
                                    name="firstName"
                                    variant="outlined"
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    inputProps={{maxLength: 50}}
                                    onBlur={handleBlur}
                                    value={values.firstName}
                                    disabled={isSubmitting || emailSent || generalLoading}
                                    error={Boolean(errors.firstName && touched.firstName && errors.firstName)}
                                    onChange={handleChange}
                                    helperText={errors.firstName && touched.firstName && errors.firstName}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    id="lastName"
                                    inputProps={{maxLength: 50}}
                                    maxLength="50"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="lname"
                                    onBlur={handleBlur}
                                    disabled={isSubmitting || emailSent || generalLoading}
                                    value={values.lastName}
                                    error={Boolean(errors.lastName && touched.lastName && errors.lastName)}
                                    onChange={handleChange}
                                    helperText={errors.lastName && touched.lastName && errors.lastName}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    helperText={errors.email && touched.email && errors.email}
                                    error={Boolean(errors.email && touched.email && errors.email)}
                                    autoComplete="email"
                                    id='emailInput'
                                    name='email'
                                    placeholder='Email'
                                    onChange={handleChange} onBlur={handleBlur} value={values.email}
                                    disabled={isSubmitting || emailSent || generalLoading}
                                    label="Email Address"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    label="Password"
                                    id="password"
                                    autoComplete="current-password"
                                    type='password'
                                    name='password'
                                    error={Boolean(errors.password && touched.password && errors.password)}
                                    helperText={errors.password && touched.password && errors.password}
                                    placeholder='Password'
                                    onChange={handleChange} onBlur={handleBlur}
                                    value={values.password}
                                    disabled={isSubmitting || emailSent || generalLoading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    label="Confirm Password"
                                    autoComplete="current-password"
                                    error={Boolean(errors.confirmPassword && touched.confirmPassword && errors.confirmPassword)}
                                    helperText={errors.confirmPassword && touched.confirmPassword && errors.confirmPassword}
                                    id='confirmPasswordInput'
                                    type='password'
                                    name='confirmPassword'
                                    placeholder='Confirm Password'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.confirmPassword}
                                    disabled={isSubmitting || emailSent || generalLoading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Checkbox
                                        name='agreeTerm'
                                        placeholder='Confirm Password'
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.agreeTerm}
                                        disabled={isSubmitting || emailSent || generalLoading}
                                        color="primary"
                                    />}
                                    label={<>I agree to
                                        the <Link href='/terms'><a>Terms & Conditions</a></Link> and the <Link
                                            href='/privacy'><a>Privacy Policy</a></Link></>}
                                />
                                <FormHelperText
                                    error={errors.agreeTerm && touched.agreeTerm && errors.agreeTerm}>
                                    {errors.agreeTerm && touched.agreeTerm && errors.agreeTerm}
                                </FormHelperText>
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={emailSent}
                            endIcon={(isSubmitting || generalLoading) &&
                            <CircularProgress size={20} color="inherit"/>}
                            className={classes.submit}
                        >
                            Sign up
                        </Button>
                        <div className={classes.resetEmail}>
                            <div style={{marginBottom: '5px'}}>Already part of the family?</div>
                            <Link href='/login'><a href='#'>Log in</a></Link>
                        </div>
                        <div className={classes.resetEmail}>
                            <div style={{marginBottom: '5px'}}>Having issues signing up?<a
                                style={{marginLeft: '5px'}} href="mailto:maximilian@careerfairy.io">Let us
                                know</a></div>
                        </div>
                        {errorMessageShown && <FormHelperText error>An error
                            occurred while creating to your account</FormHelperText>}
                    </form>
                )}
            </Formik>
        </Fragment>
    )
}

function SignUpFormValidate({user, router, setEmailVerificationSent, setActiveStep}) {
    const classes = useStyles()

    const [errorMessageShown, setErrorMessageShown] = useState(false);
    const [incorrectPin, setIncorrectPin] = useState(false);
    const [generalLoading, setGeneralLoading] = useState(false);

    function resendVerificationEmail() {
        setGeneralLoading(true);
        axios({
            method: 'post',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendPostmarkEmailVerificationEmailWithPin',
            data: {
                recipientEmail: user.email,
            }
        }).then(response => {
            setIncorrectPin(false);
            setEmailVerificationSent(true);
            setGeneralLoading(false);
        }).catch(error => {
            setIncorrectPin(false);
            setGeneralLoading(false);
        });
    }

    return (
        <Fragment>
            <div className='tealBackground'>
                <Container>
                    <div className='formContainer'>
                        <Formik
                            initialValues={{pinCode: ''}}
                            validate={values => {
                                let errors = {};
                                if (!values.pinCode) {
                                    errors.pinCode = 'A PIN code is required';
                                } else if (!/^[0-9]{4}$/.test(values.pinCode)) {
                                    errors.pinCode = 'The PIN code must be number between 0 and 9999';
                                }
                                return errors;
                            }}
                            onSubmit={(values, {setSubmitting}) => {
                                setIncorrectPin(false);
                                axios({
                                    method: 'post',
                                    url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/verifyEmailWithPin',
                                    data: {
                                        recipientEmail: user.email,
                                        pinCode: parseInt(values.pinCode)
                                    }
                                }).then(response => {
                                    setActiveStep(2)
                                    // user.reload().then(() => {
                                    // handleNext()
                                    // return router.push('/profile');
                                    // });
                                }).catch(error => {
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
                                <Form id='signUpForm' onSubmit={handleSubmit}>
                                    <Message positive hidden={false}>
                                        <Message.Header>Check your mailbox!</Message.Header>
                                        <p>We have just sent you an email containing a 4-digit PIN code. Please enter
                                            this code below to start your journey on CareerFairy. <span
                                                className='resend-link' onClick={() => resendVerificationEmail()}>Resend the email verification link.</span>
                                        </p>
                                    </Message>
                                    <Form.Field>
                                        <label style={{color: 'rgb(120,120,120)'}}>PIN Code</label>
                                        <input id='pinCode' type='text' name='pinCode' placeholder='PIN Code'
                                               onChange={handleChange} onBlur={handleBlur} value={values.pinCode}
                                               disabled={isSubmitting || generalLoading} maxLength='4'/>
                                        <div className='field-error'>
                                            {errors.pinCode && touched.pinCode && errors.pinCode}
                                        </div>
                                    </Form.Field>
                                    <Button id='submitButton' fluid primary size='big' type="submit"
                                            loading={isSubmitting || generalLoading}>Validate Email</Button>
                                    <Message negative hidden={!incorrectPin}>
                                        <Message.Header>Incorrect PIN</Message.Header>
                                        <p>The PIN code you entered appears to be incorrect. <span
                                            className='resend-link' onClick={() => resendVerificationEmail()}>Resend the verification email.</span>
                                        </p>
                                    </Message>
                                    <div className='reset-email'>
                                        <div style={{marginBottom: '5px'}}>Having issues signing up?<a
                                            style={{marginLeft: '5px'}} href="mailto:maximilian@careerfairy.io">Let us
                                            know</a></div>
                                    </div>
                                    <div className={'errorMessage ' + (errorMessageShown ? '' : 'hidden')}>An error
                                        occured while creating to your account
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                    <style jsx>{`
                                
                            .hidden {
                                display: none
                            }

                            #signingContainer {
                                width: 55%;
                                padding: 50px;
                                height: 100%;
                                border: 2px solid red;
                            }

                            #signingContainer h5{
                                font-weight: 400;
                            }

                            #signUpForm h1 {
                                color: rgb(0,212,170);
                                margin-bottom: 30px;
                            }

                            #signUpForm label{
                                font-weight: 400;
                                font-size: 0.95em;
                                margin-bottom: 15px;
                                color: dimgrey;
                            }

                            .emailSignUpInfo {
                                margin-top: 10px;
                                font-size: 1em;
                                color: white;
                                margin: 0 auto;
                                text-align: center;
                            }

                            .formContainer {
                                max-width: 500px;
                                background-color: rgb(240,240,240);
                                margin: 2% auto 20px auto;
                                padding: 30px 50px;
                                border-radius: 5px;
                                box-shadow: 0 0 5px rgb(150,150,150);
                            }

                            label {
                                color: rgb(160,160,160);
                            }

                            .socialLoginBlock {
                                margin: 30px 0 0 0;
                            }

                            .socialLogin {
                                margin: 15px 0 0 0;
                            }

                            .field-error {
                                margin-top: 10px;
                                color: red;
                            }

            

                            #loginButton {
                                margin-top: 40px;
                            }

                            .errorMessage {
                                padding: 20px;
                                text-align: center;
                                color: red;
                            }

                            .loginModal {
                                background-color: rgb(230,230,230);
                                padding: 60px;
                                font-weight: 3em;
                            }

                            #loginModalTitle {
                                font-size: 4em;
                                color: rgb(0, 210, 170);
                            }

                            #loginModalLogo {
                                margin-top: 50px;
                                max-height: 150px;
                            }

                            .loginModalPrivacy {
                                margin-top: 30px;
                            }

                            .reset-email {
                                margin: 20px auto 0 auto;
                                text-align: center;
                            }

                            .resend-link {
                                text-decoration: underline;
                                cursor: pointer;
                            }
                        `}</style>
                </Container>
            </div>
        </Fragment>
    )
}
