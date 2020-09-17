import React, {Fragment, useState, useEffect} from 'react';
import {Form, Header, Image, Message, Icon} from "semantic-ui-react";
import {withFirebase} from "../data/firebase";

import {useRouter} from 'next/router';
import Link from 'next/link';
import {Formik} from 'formik';
import axios from 'axios';

import Head from 'next/head';
import {TealBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import {
    Box,
    Container,
    Grid,
    Typography,
    TextField,
    CircularProgress,
    Button,
    Link as MuiLink, Paper
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import TheatersRoundedIcon from "@material-ui/icons/TheatersRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import BusinessCenterRoundedIcon from "@material-ui/icons/BusinessCenterRounded";
import MicOutlinedIcon from '@material-ui/icons/MicOutlined';

const useStyles = makeStyles((theme) => ({
    box: {
        width: '100%', // Fix IE 11 issue.
        backgroundColor: "white",
        marginTop: theme.spacing(3),
        borderRadius: 5
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
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
        color: 'rgb(0, 210, 170)',
        fontWeight: '500',
        fontSize: '2em',
        margin: '20px',
        textAlign: 'center'
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    iconWrapper: {
        display: "flex",
        justifyContent: "center",
        "& .MuiSvgIcon-root": {
            margin: '0 10px',
        }
    },
    message: {
        color: "#2c662d",
        padding: "1rem",
        backgroundColor: "#fcfff5",
        margin: "1rem 0"
    }
}));

function LogInPage(props) {

    const [user, setUser] = useState(null);
    const [userEmailNotValidated, setUserEmailNotValidated] = useState(false);
    const [generalLoading, setGeneralLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user !== null) {
                setUser(user);
            } else {
                setUser(null);
            }
        })
    }, []);

    useEffect(() => {
        if (user) {
            if (!user.emailVerified) {
                router.replace('/signup');
            } else {
                props.firebase.getUserData(user.email).then(querySnapshot => {
                    if (querySnapshot.exists) {
                        router.replace('/next-livestreams');
                    } else {
                        router.replace('/profile');
                    }
                    setGeneralLoading(false);
                })
            }
        }
    }, [user]);

    useEffect(() => {
        if (userEmailNotValidated) {
            router.replace('/signup');
        }
    }, [userEmailNotValidated]);

    return (
        <TealBackground>
            <header>
                <Link href='/'><a><img alt="logo" src='/logo_white.png'
                                         style={{width: '150px', margin: '20px', display: 'inline-block'}}/></a></Link>
            </header>
            <LogInForm userEmailNotValidated={userEmailNotValidated}
                       setUserEmailNotValidated={(value) => setUserEmailNotValidated(value)}
                       setGeneralLoading={(value) => setGeneralLoading(value)} generalLoading={generalLoading}/>
        </TealBackground>
    )
}

export default withFirebase(LogInPage);

const LogInForm = withFirebase(LogInFormBase);

export function LogInFormBase(props) {
    const classes = useStyles()

    const [errorMessageShown, setErrorMessageShown] = useState(false);
    const [noAccountMessageShown, setNoAccountMessageShown] = useState(false);
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);

    function resendEmailVerificationLink(email) {
        setErrorMessageShown(false);
        props.setGeneralLoading(true);
        axios({
            method: 'post',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendPostmarkEmailVerificationEmail',
            data: {
                recipientEmail: email,
                redirect_link: 'https://careerfairy.io/login'
            }
        }).then(response => {
            setEmailVerificationSent(true);
            props.setGeneralLoading(false);
        }).catch(error => {
            props.setGeneralLoading(false);
        });
    }

    return (
        <Fragment>
            <Head>
                <title key="title">CareerFairy | Log in</title>
            </Head>
            <Formik
                initialValues={{email: '', password: '',}}
                validate={values => {
                    let errors = {};
                    if (!values.email) {
                        errors.email = 'Your email is required';
                    } else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(values.email)) {
                        errors.email = 'Please enter a valid email address';
                    }
                    if (!values.password) {
                        errors.password = 'A password is required';
                    }
                    return errors;
                }}
                onSubmit={(values, {setSubmitting}) => {
                    props.setGeneralLoading(true);
                    setErrorMessageShown(false);
                    props.setUserEmailNotValidated(false);
                    props.firebase.signInWithEmailAndPassword(values.email, values.password)
                        .then(() => {
                            setSubmitting(false);
                        })
                        .catch(error => {
                            setSubmitting(false);
                            props.setGeneralLoading(false);
                            if (error.code === 'auth/user-not-found') {
                                return setNoAccountMessageShown(true);
                            } else {
                                return setErrorMessageShown(true);
                            }
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
                      isSubmitting,
                      /* and other goodies */
                  }) => (
                    <Container maxWidth="sm">
                        <Box boxShadow={1} p={3} className={classes.box}>
                            <form className={classes.form} onSubmit={handleSubmit}>
                                <Box className={classes.iconWrapper}>
                                    <MicOutlinedIcon color="disabled" fontSize="large"/>
                                    <BusinessCenterRoundedIcon color="disabled" fontSize="large"/>
                                    <TheatersRoundedIcon color="disabled" fontSize="large"/>
                                </Box>
                                <Typography className={classes.title}>
                                    CareerFairy
                                </Typography>
                                <TextField
                                    label="Email"
                                    id='email'
                                    name='email'
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    placeholder='Email Address'
                                    autoComplete="email"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.email}
                                    helperText={errors.email && touched.email && errors.email}
                                    error={Boolean(errors.email && touched.email)}
                                    disabled={isSubmitting}
                                />
                                <TextField
                                    id='password'
                                    type='password'
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                    label="Password"
                                    name='password'
                                    autoComplete="current-password"
                                    placeholder='Password'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.password}
                                    disabled={isSubmitting}
                                    helperText={errors.password && touched.password && errors.password}
                                    error={Boolean(errors.password && touched.password && errors.password)}
                                />
                                <Button id='submitButton'
                                        color="primary"
                                        className={classes.submit}
                                        size='large'
                                        variant="contained"
                                        type="submit"
                                        fullWidth
                                        disabled={isSubmitting || props.generalLoading}
                                        endIcon={(isSubmitting || props.generalLoading) &&
                                        <CircularProgress size={20} color="inherit"/>}>
                                    Log in
                                </Button>
                                <Grid style={{marginBottom: "1rem"}} container>
                                    <Grid item xs>
                                        <MuiLink href='/reset-password'>Forgot password?</MuiLink>
                                    </Grid>
                                    <Grid item>
                                        New to career streaming?
                                        <MuiLink href='/signup'> Sign Up</MuiLink>
                                    </Grid>
                                </Grid>
                                <Typography gutterBottom variant="subtitle1" align="center" color="secondary"
                                            hidden={!errorMessageShown}>
                                    An error occurred while logging in to your account
                                </Typography>
                                <Typography gutterBottom variant="subtitle1" align="center" color="secondary"
                                            hidden={!noAccountMessageShown}>
                                    No account associated with this email address.
                                </Typography>
                                <Paper hidden={!props.userEmailNotValidated}
                                       className={classes.message}
                                       elevation={3}>
                                    <Typography variant="h6" gutterBottom>Please validate your email
                                        address</Typography>
                                    <p>We sent you an email verification link to this email address. Please click on
                                        it to start your journey on CareerFairy.</p>
                                    <a href="#" onClick={() => resendEmailVerificationLink(values.email)}>
                                        Resend the email verification link.
                                    </a>
                                </Paper>
                                <Paper elevation={3} className={classes.message} hidden={!emailVerificationSent}>
                                    <Typography variant="h6" gutterBottom>Verification Email Sent</Typography>
                                    <p>
                                        We have a just send an email verification link to the address you provided.
                                        Please
                                        click
                                        on it to start your journey on CareerFairy.
                                    </p>
                                </Paper>
                            </form>
                        </Box>
                    </Container>
                )}
            </Formik>
            <Typography className={classes.footer}>
                Meet Your Future
            </Typography>
        </Fragment>
    )
}