import React, {Fragment, useState, useEffect} from 'react';
import {Button, Container, Form, Header, Image, Message, Icon} from "semantic-ui-react";
import { withFirebase} from "../data/firebase";

import { useRouter } from 'next/router';
import Link from 'next/link';
import {Formik} from 'formik';
import axios from 'axios';

import Head from 'next/head';

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
    },[]);

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
    },[user]);

    useEffect(() => {
        if (userEmailNotValidated) {
            router.replace('/signup');
        }
    },[userEmailNotValidated]);

    return (
        <div className='tealBackground'>
            <header>
                <Link href='/'><a><Image src='/logo_white.png' style={{ width: '150px', margin: '20px', display: 'inline-block' }} /></a></Link>
            </header>
            <LogInForm userEmailNotValidated={userEmailNotValidated} setUserEmailNotValidated={(value) => setUserEmailNotValidated(value)} setGeneralLoading={(value) => setGeneralLoading(value)} generalLoading={generalLoading}/>
            <style jsx>{`
                .tealBackground {
                    min-height: 100vh;
                    height: 100%;
                    background-color: rgb(0, 210, 170);
                    padding: 0 0 40px 0;
                }
            `}</style>
        </div>
    )
}

export default withFirebase(LogInPage);

const LogInForm = withFirebase(LogInFormBase);

export function LogInFormBase(props) {

    const router = useRouter();
    const [successMessageShown, setSuccessMessageShown] = useState(false);
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
        }).then( response => {        
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
            <div className='tealBackground'>
                <Container>
                    <div className='formContainer'>
                        <Formik
                            initialValues={{ email: '', password: '', }}
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
                            onSubmit={(values, { setSubmitting }) => {
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
                                <Form id='signUpForm' onSubmit={handleSubmit}>
                                    <div style={{ textAlign: 'center', color: 'rgb(200,200,200)' }}>
                                        <Icon name='microphone' size='big' style={{ margin: '0 10px'}}/>
                                        <Icon name='briefcase' size='big' style={{ margin: '0 10px'}}/>
                                        <Icon name='film' size='big' style={{ margin: '0 10px'}}/>
                                    </div>
                                    <div style={{ color: 'rgb(0, 210, 170)', fontWeight: '500', fontSize: '2em', margin: '40px 0 30px 0', textAlign: 'center' }}>
                                        CareerFairy
                                    </div>
                                    <Form.Field>
                                        <label style={{ color: 'rgb(120,120,120)' }}>Email</label>
                                        <input id='emailInput' type='text' name='email' placeholder='Email' onChange={handleChange} onBlur={handleBlur} value={values.email} disabled={isSubmitting} />
                                        <div className='field-error'>
                                            {errors.email && touched.email && errors.email}
                                        </div>
                                    </Form.Field>
                                    <Form.Field>
                                        <label style={{ color: 'rgb(120,120,120)' }}>Password</label>
                                        <input id='passwordInput' type='password' name='password' placeholder='Password' onChange={handleChange} onBlur={handleBlur} value={values.password} disabled={isSubmitting} />
                                        <div className='field-error'>
                                            {errors.password && touched.password && errors.password}
                                        </div>
                                    </Form.Field>
                                    <Button id='submitButton' fluid primary size='big' type="submit" loading={isSubmitting || props.generalLoading}>Log in</Button>
                                    <div className='reset-email'>
                                        <Link href='/reset-password'><a href='#'>Forgot your password?</a></Link>
                                    </div> 
                                    <div className='reset-email'>
                                        <div style={{ marginBottom: '5px'}}>New to career streaming?</div>
                                        <Link href='/signup'><a href='#'>Sign up</a></Link>
                                    </div> 
                                    <div className={'errorMessage ' + (errorMessageShown ? '' : 'hidden')}>An error occurred while logging in to your account</div>
                                    <div className={'errorMessage ' + (noAccountMessageShown ? '' : 'hidden')}>No account associated with this email address.</div>
                                    <Message positive hidden={!props.userEmailNotValidated}>
                                        <Message.Header>Please validate your email address</Message.Header>
                                        <p>We sent you an email verification link to this email address. Please click on it to start your journey on CareerFairy.</p>
                                        <p className='resend-link' onClick={() => resendEmailVerificationLink(values.email)}>Resend the email verification link.</p>
                                    </Message>
                                    <Message positive hidden={!emailVerificationSent}>
                                        <Message.Header>Verification Email Sent</Message.Header>
                                        <p>
                                        We have a just send an email verification link to the address you provided. Please click on it to start your journey on CareerFairy.
                                        </p>
                                    </Message>
                                </Form>
                            )}
                            </Formik>
                        </div>
                        <div style={{ color: 'white', fontWeight: '700', fontSize: '1.3em', margin: '40px 0 30px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                            Meet Your Future
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
                                //margin-top: 10px;
                                font-size: 1em;
                                color: white;
                                margin: 0 auto;
                                text-align: center;
                            }

                            .formContainer {
                                max-width: 500px;
                                background-color: rgb(240,240,240);
                                margin: 2% auto 20px auto;
                                padding: 30px 50px 30px 50px;
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