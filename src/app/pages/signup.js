import React, {useState, useEffect} from 'react';
import {Button, Container, Form, Header, Image, Message, Icon} from "semantic-ui-react";
import { withFirebase} from "../data/firebase";

import { useRouter } from 'next/router';
import Link from 'next/link';
import {Formik} from 'formik';

function SignUpPage(props) {

    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user !== null) {
                setAuthenticated(true);
            } else {
                setAuthenticated(false);
            }
        })
    },[]);

    if (authenticated) {
        router.replace('/');
    }

    return (
        <div>
            <header>
                <Link href='/'><a><Image src='/logo_teal.png' style={{ width: '150px', margin: '20px', display: 'inline-block' }} /></a></Link>
            </header>
            <SignUpForm/>
        </div>
    )
}

export default withFirebase(SignUpPage);

const SignUpForm = withFirebase(SignUpFormBase);

export function SignUpFormBase(props) {

    const [emailSent, setEmailSent] = useState(false);
    const [errorMessageShown, setErrorMessageShown] = useState(false);

    return (
        <div id='creamBackground'>
            <Container id='signingContainer'>
                <Formik
                    initialValues={{ email: '' }}
                    validate={values => {
                        let errors = {};
                        if (!values.email) {
                             errors.email = 'Required';
                        } 
                        else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(values.email)) {
                            errors.email = 'Please enter a valid email address';
                        }
                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        setErrorMessageShown(false);
                        props.firebase.sendSignInLinkToEmail(values.email)
                            .then(() => { 
                                setSubmitting(false);
                                setEmailSent(true);
                                window.localStorage.setItem('emailForSignIn', values.email);
                            }).catch(error => {
                                setErrorMessageShown(false);
                                console.log(error);
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
                            <Header as='h1' textAlign='center' style={{ color: 'rgb(0, 210,170)' }}>
                                <Icon name='hand spock outline' style={{ color: 'rgb(0, 210,170)' }}/>
                                Be part of a story
                            </Header>
                            <Message
                                header='Passwordless Login'
                                hidden={!emailSent}
                                color='green'
                                content='We have just sent you an email containing a login link. Please use it to log in to CareerFairy!'
                            />
                            <Form.Field>
                                <label>Email</label>
                                <input id='emailInput' type='text' name='email' placeholder='Email' onChange={handleChange} onBlur={handleBlur} value={values.email} disabled={isSubmitting || emailSent} />
                                <div className='field-error'>
                                    {errors.email && touched.email && errors.email}
                                </div>
                            </Form.Field>
                            <Button id='submitButton' fluid primary size='large' disabled={emailSent} type="submit" loading={isSubmitting}>Log in</Button>
                            <div className={'errorMessage ' + (errorMessageShown ? '' : 'hidden')}>An error occured while logging in to your account</div>
                            <div className='emailSignUpInfo'>
                                You will receive an email containing a link allowing you to log in to CareerFairy. <br/><br/>
                            </div>
                        </Form>
                    )}
                    </Formik>
                    <style jsx>{`
                        .hidden {
                            display: none;
                        }

                        #creamBackground {
                            width: 100%;
                            height: 100%;
                        }

                        #signingContainer {
                            width: 55%;
                            padding: 50px;
                            height: 100%;
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
                            font-size: 0.9em;
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
                    `}</style>
            </Container>
        </div>
    )
}