import React, {Fragment, useState, useEffect} from 'react';
import {Button, Container, Form, Header, Image, Message, Icon, Checkbox} from "semantic-ui-react";
import { withFirebase} from "../data/firebase";

import { useRouter } from 'next/router';
import Link from 'next/link';
import {Formik} from 'formik';
import axios from 'axios';

import Head from 'next/head';

function SignUpPage(props) {

    const [user, setUser] = useState(false);
    const [userEmailVerified, setUserEmailVerified] = useState(false);
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

    return (
        <div className='tealBackground'>
            <header>
                <Link href='/'><a><Image src='/logo_white.png' style={{ width: '150px', margin: '20px', display: 'inline-block' }} /></a></Link>
            </header>
            <SignUpForm user={user}/>
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

export default withFirebase(SignUpPage);

const SignUpForm = withFirebase(SignUpFormBase);

export function SignUpFormBase(props) {

    const [emailSent, setEmailSent] = useState(false);
    const [errorMessageShown, setErrorMessageShown] = useState(false);
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [generalLoading, setGeneralLoading] = useState(false);

    useEffect(() => {
        if (emailSent && props.user && !emailVerificationSent) {
            axios({
                method: 'post',
                url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendPostmarkEmailVerificationEmail',
                data: {
                    recipientEmail: props.user.email,
                    redirect_link: 'https://careerfairy.io/login'
                }
            }).then( response => { 
                    props.firebase.auth.signOut().then(() => {
                        setEmailVerificationSent(true);
                        setGeneralLoading(false);
                    })
                }).catch(error => {
                    setGeneralLoading(false);
            });
        }
    },[props.user, emailSent]);

    return (
        <Fragment>
            <Head>
                <title key="title">CareerFairy | Sign up</title>
            </Head>
            <div className='tealBackground'>
                <Container>
                    <div className='formContainer'>
                        <Formik
                            initialValues={{ email: '', password: '', confirmPassword: '', agreeTerm: false }}
                            validate={values => {
                                let errors = {};
                                if (!values.email) {
                                    errors.email = 'Your email is required';
                                } else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(values.email)) {
                                    errors.email = 'Please enter a valid email address';
                                }       
                                
                                if (!values.password) {
                                    errors.password = 'A password is required';
                                }  else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/i.test(values.password)) {
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
                            onSubmit={(values, { setSubmitting }) => {
                                setErrorMessageShown(false);
                                setEmailSent(false);
                                setGeneralLoading(true);
                                props.firebase.createUserWithEmailAndPassword(values.email, values.password)
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
                                <Form id='signUpForm' onSubmit={handleSubmit}>
                                    <div style={{ textAlign: 'center', color: 'rgb(200,200,200)' }}>
                                        <Icon name='film' size='big' style={{ margin: '0 10px'}}/>
                                        <Icon name='arrow right circle alternate' size='big' style={{ margin: '0 10px'}}/>
                                        <Icon name='briefcase' size='big' style={{ margin: '0 10px'}}/>
                                    </div>
                                    <div style={{ color: 'rgb(0, 210, 170)', fontWeight: '500', fontSize: '2em', margin: '40px 0 30px 0', textAlign: 'center' }}>
                                        CareerFairy
                                    </div>
                                    <Form.Field>
                                        <label style={{ color: 'rgb(120,120,120)' }}>Email</label>
                                        <input id='emailInput' type='text' name='email' placeholder='Email' onChange={handleChange} onBlur={handleBlur} value={values.email} disabled={isSubmitting || emailSent || generalLoading} />
                                        <div className='field-error'>
                                            {errors.email && touched.email && errors.email}
                                        </div>
                                    </Form.Field>
                                    <Form.Field>
                                        <label style={{ color: 'rgb(120,120,120)' }}>Password</label>
                                        <input id='passwordInput' type='password' name='password' placeholder='Password' onChange={handleChange} onBlur={handleBlur} value={values.password} disabled={isSubmitting || emailSent || generalLoading} />
                                        <div className='field-error'>
                                            {errors.password && touched.password && errors.password}
                                        </div>
                                    </Form.Field>
                                    <Form.Field>
                                        <label style={{ color: 'rgb(120,120,120)' }}>Confirm Password</label>
                                        <input id='confirmPasswordInput' type='password' name='confirmPassword' placeholder='Confirm Password' onChange={handleChange} onBlur={handleBlur} value={values.confirmPassword} disabled={isSubmitting || emailSent || generalLoading} />
                                        <div className='field-error'>
                                            {errors.confirmPassword && touched.confirmPassword && errors.confirmPassword}
                                        </div>
                                    </Form.Field>
                                    <Form.Field>
                                        <input id='agreeTerm' type='checkbox' style={{ display: 'inline-block', margin: '0 0 10px 0'}} name='agreeTerm' placeholder='Confirm Password' onChange={handleChange} onBlur={handleBlur} value={values.agreeTerm} disabled={isSubmitting || emailSent || generalLoading} />
                                        <label style={{ display: 'inline-block', margin: '0 0 3px 10px'}}>I agree to the <Link href='/terms'><a>Terms & Conditions</a></Link> and the <Link href='/privacy'><a>Privacy Policy</a></Link></label>
                                        <div className='field-error'>
                                            {errors.agreeTerm && touched.agreeTerm  && errors.agreeTerm}
                                        </div>
                                    </Form.Field>
                                    <Button id='submitButton' fluid primary size='big' disabled={emailSent} type="submit" loading={isSubmitting || generalLoading}>Sign up</Button>
                                    <Message positive hidden={!emailVerificationSent}>
                                        <Message.Header>Verification Email Sent</Message.Header>
                                        <p>
                                        We have a just send an email verification link to the address you provided. Please click on it to start your journey on CareerFairy.
                                        </p>
                                    </Message>
                                    <div className='reset-email'>
                                        <div style={{ marginBottom: '5px'}}>Already part of the family?</div>
                                        <Link href='/login'><a href='#'>Log in</a></Link>
                                    </div> 
                                    <div className='reset-email'>
                                        <div style={{ marginBottom: '5px'}}>Having issues signing up?<a style={{ marginLeft: '5px'}} href="mailto:maximilian@careerfairy.io">Let us know</a></div>
                                    </div> 
                                    <div className={'errorMessage ' + (errorMessageShown ? '' : 'hidden')}>An error occured while creating to your account</div>
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
                        `}</style>
                </Container>
            </div>
        </Fragment>
    )
}