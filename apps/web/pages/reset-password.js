import React, { Fragment, useState, useEffect } from "react"
import {
   useFirebaseService,
   withFirebase,
} from "../context/firebase/FirebaseServiceContext"

import MicIcon from "@mui/icons-material/Mic"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter"
import CircularProgress from "@mui/material/CircularProgress"

import { useRouter } from "next/router"
import Link from "next/link"
import { Formik } from "formik"
import axios from "axios"

import Head from "next/head"
import { useAuth } from "../HOCs/AuthProvider"
import { Button, Card, Container, TextField, Typography } from "@mui/material"

function ResetPasswordPage(props) {
   const { authenticatedUser: user } = useAuth()
   const router = useRouter()
   const firebase = useFirebaseService()

   useEffect(() => {
      if (user.isLoaded && !user.isEmpty) {
         if (!firebase.auth?.currentUser?.emailVerified) {
            router.replace("/signup")
         } else {
            router.replace("/profile")
         }
      }
   }, [user, firebase.auth?.currentUser?.emailVerified])

   return (
      <div className="tealBackground">
         <header>
            <Link href="/">
               <a>
                  <img
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
         <ResetPasswordBase user={user} />
         <style jsx>{`
            .tealBackground {
               height: 100vh;
               background-color: rgb(0, 210, 170);
            }
         `}</style>
      </div>
   )
}

export default withFirebase(ResetPasswordPage)

const LogInForm = withFirebase(ResetPasswordBase)

export function ResetPasswordBase(props) {
   const [completed, setCompleted] = useState(false)

   return (
      <Fragment>
         <Head>
            <title key="title">CareerFairy | Reset Password</title>
         </Head>
         <div className="tealBackground">
            <Container>
               <div className="formContainer">
                  <Formik
                     initialValues={{ email: "" }}
                     validate={(values) => {
                        let errors = {}
                        if (!values.email) {
                           errors.email = "Please enter your email"
                        }
                        return errors
                     }}
                     onSubmit={(values, { setSubmitting }) => {
                        setCompleted(false)
                        axios({
                           method: "post",
                           url: "https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendPostmarkResetPasswordEmail",
                           data: {
                              recipientEmail: values.email,
                              redirect_link: "https://careerfairy.io/login",
                           },
                        })
                           .then((response) => {
                              setSubmitting(false)
                              setCompleted(true)
                           })
                           .catch((error) => {
                              setSubmitting(false)
                              setCompleted(true)
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
                        <form id="signUpForm" onSubmit={handleSubmit}>
                           <div
                              style={{
                                 textAlign: "center",
                                 color: "rgb(200,200,200)",
                              }}
                           >
                              <MicIcon
                                 fontSize="large"
                                 style={{ margin: "0 10px" }}
                              />
                              <ArrowForwardIosIcon
                                 fontSize="large"
                                 style={{ margin: "0 10px" }}
                              />
                              <BusinessCenterIcon
                                 fontSize="large"
                                 style={{ margin: "0 10px" }}
                              />
                           </div>
                           <div
                              style={{
                                 color: "rgb(0, 210, 170)",
                                 fontWeight: "500",
                                 fontSize: "2em",
                                 margin: "40px 0 30px 0",
                                 textAlign: "center",
                              }}
                           >
                              CareerFairy
                           </div>
                           <div>
                              {/* <label style={{ color: 'rgb(120,120,120)' }}>Email</label>
                                        <input id='emailInput' type='text' name='email'  onChange={handleChange} onBlur={handleBlur} value={values.email} disabled={isSubmitting} /> */}
                              <TextField
                                 required
                                 name="email"
                                 id="outlined-required"
                                 placeholder="Email"
                                 onChange={handleChange}
                                 value={values.email}
                                 disabled={isSubmitting}
                                 label="Email"
                                 variant="outlined"
                                 fullWidth={true}
                              />
                              <div className="field-error">
                                 {errors.email && touched.email && errors.email}
                              </div>
                           </div>
                           <Button
                              type="submit"
                              disabled={isSubmitting}
                              startIcon={
                                 isSubmitting && (
                                    <CircularProgress
                                       fontSize="small"
                                       style={{ color: "white" }}
                                    />
                                 )
                              }
                              color="primary"
                              variant="contained"
                              fullWidth={true}
                           >
                              Reset Password
                           </Button>
                           {completed && (
                              <Card style={{ padding: 10, marginTop: 20 }}>
                                 <Typography
                                    variant="h4"
                                    style={{ marginBottom: 10 }}
                                 >
                                    Done!
                                 </Typography>
                                 <p>
                                    If you're email is registered, you will
                                    shortly receive an email to complete your
                                    password reset.
                                 </p>
                              </Card>
                           )}
                        </form>
                     )}
                  </Formik>
               </div>
               <div
                  style={{
                     color: "white",
                     fontWeight: "700",
                     fontSize: "1.3em",
                     margin: "40px 0 30px 0",
                     textAlign: "center",
                     textTransform: "uppercase",
                     letterSpacing: "0.4em",
                  }}
               >
                  Meet Your Future
               </div>
               <style jsx>{`
                  .hidden {
                     display: none;
                  }

                  #signingContainer {
                     width: 55%;
                     padding: 50px;
                     height: 100%;
                  }

                  #signingContainer h5 {
                     font-weight: 400;
                  }

                  #signUpForm h1 {
                     color: rgb(0, 212, 170);
                     margin-bottom: 30px;
                  }

                  #signUpForm label {
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
                     background-color: rgb(240, 240, 240);
                     margin: 2% auto 20px auto;
                     padding: 30px 50px 30px 50px;
                     border-radius: 5px;
                     box-shadow: 0 0 5px rgb(150, 150, 150);
                  }

                  label {
                     color: rgb(160, 160, 160);
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
                     background-color: rgb(230, 230, 230);
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
               `}</style>
            </Container>
         </div>
      </Fragment>
   )
}
