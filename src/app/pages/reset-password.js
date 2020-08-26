import React, {Fragment, useState, useEffect} from 'react';
import {Button, Container, Form, Header, Image, Message, Icon} from "semantic-ui-react";
import { withFirebase} from "../context/firebase";

import { useRouter } from 'next/router';
import Link from 'next/link';
import {Formik} from 'formik';
import axios from 'axios';

import Head from 'next/head';

function ResetPasswordPage(props) {

    const [user, setUser] = useState(null);
    const [userEmailNotValidated, setUserEmailNotValidated] = useState(false);
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
                router.replace('/profile');
            }
        }
    },[user]);

    return (
        <div className='tealBackground'>
            <header>
                <Link href='/'><a><Image src='/logo_white.png' style={{ width: '150px', margin: '20px', display: 'inline-block' }} /></a></Link>
            </header>
            <ResetPasswordBase user={user}/>
            <style jsx>{`
                .tealBackground {
                    height: 100vh;
                    background-color: rgb(0, 210, 170);
                }
            `}</style>
        </div>
    )
}

export default withFirebase(ResetPasswordPage);

const LogInForm = withFirebase(ResetPasswordBase);

export function ResetPasswordBase(props) {

    const router = useRouter();
    const [successMessageShown, setSuccessMessageShown] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [noAccountMessageShown, setNoAccountMessageShown] = useState(false);

    return (
        <Fragment>
            <Head>
                <title key="title">CareerFairy | Reset Password</title>
            </Head>
            <div className='tealBackground'>
                <Container>
                    <div className='formContainer'>
                        <Formik
                            initialValues={{ email: '', }}
                            validate={values => {
                                let errors = {};         
                                if (!values.email) {
                                    errors.email = 'Please enter your email';
                                } 
                                return errors;
                            }}
                            onSubmit={(values, { setSubmitting }) => {
                                setCompleted(false);
                                axios({
                                    method: 'post',
                                    url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendPostmarkResetPasswordEmail',
                                    data: {
                                        recipientEmail: values.email,
                                        redirect_link: 'https://careerfairy.io/login'
                                    }
                                }).then( response => { 
                                        setSubmitting(false);
                                        setCompleted(true);
                                    }).catch(error => {
                                        setSubmitting(false);
                                        setCompleted(true);
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
                                    <Button id='submitButton' fluid primary size='big' type="submit" loading={isSubmitting}>Reset Password</Button> 
                                    <Message info hidden={!completed}>
                                        <Message.Header>Done!</Message.Header>
                                        <p>
                                        If you're email is registered, you will shortly receive an email to complete your password reset.
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

                            #signingContainer h5 {
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