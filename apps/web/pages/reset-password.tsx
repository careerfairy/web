import React, { useCallback, useEffect, useState } from "react"
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext"

import MicIcon from "@mui/icons-material/Mic"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter"
import CircularProgress from "@mui/material/CircularProgress"

import { useRouter } from "next/router"
import { Formik, FormikValues } from "formik"

import Head from "next/head"
import { useAuth } from "../HOCs/AuthProvider"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import FormHelperText from "@mui/material/FormHelperText"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { getBaseUrl } from "../components/helperFunctions/HelperFunctions"
import { FormikHelpers } from "formik/dist/types"
import Paper from "@mui/material/Paper"
import { MainLogo } from "../components/logos"
import Collapse from "@mui/material/Collapse"
import { PillsBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import { sxStyles } from "../types/commonTypes"
import { HeaderLogoWrapper } from "../materialUI"
import { errorLogAndNotify } from "../util/CommonUtil"
import * as yup from "yup"

const styles = sxStyles({
   formWrapper: {
      p: { xs: 2, sm: 3 },
      marginTop: 3,
   },
   formTitle: {
      color: "primary.main",
      fontWeight: "500",
      fontSize: "2em",
      mx: 0,
      my: 3,
      textAlign: "center",
   },
   logo: {
      margin: "20px 20px 0 20px",
   },
   footerInfo: {
      color: "black",
      fontWeight: "700",
      fontSize: "1.3em",
      margin: "40px 0 30px 0",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: "0.4em",
   },
   headerWrapper: {
      textAlign: "center",
   },
   icon: {
      margin: "0 10px",
   },
})

function ResetPasswordPage() {
   const { authenticatedUser: user } = useAuth()
   const router = useRouter()
   const firebase = useFirebaseService()

   useEffect(() => {
      if (user.isLoaded && !user.isEmpty) {
         if (!firebase.auth?.currentUser?.emailVerified) {
            void router.replace("/signup")
         } else {
            void router.replace("/profile")
         }
      }
   }, [user, firebase.auth?.currentUser?.emailVerified, router])

   return (
      <PillsBackground>
         <HeaderLogoWrapper>
            <MainLogo sx={styles.logo} />
         </HeaderLogoWrapper>
         <ResetPasswordBase />
      </PillsBackground>
   )
}

export default ResetPasswordPage

const schema = yup.object().shape({
   email: yup
      .string()
      .trim()
      .required("Your email is required")
      .email("Please enter a valid email address"),
})

const initialValues = { email: "" }

export function ResetPasswordBase() {
   const [completed, setCompleted] = useState(false)
   const firebase = useFirebaseService()

   const handleSubmit = useCallback(
      (values: FormikValues, helpers: FormikHelpers<FormikValues>) => {
         setCompleted(false)

         firebase
            .sendPasswordResetEmail({
               recipientEmail: values.email,
               redirectLink: `${getBaseUrl()}/login`,
            })
            .catch(errorLogAndNotify)
            .finally(() => {
               setCompleted(true)
               helpers.setSubmitting(false)
               helpers.resetForm()
            })
      },
      [firebase]
   )

   return (
      <>
         <Head>
            <title key="title">CareerFairy | Reset Password</title>
         </Head>
         <Container maxWidth={"sm"}>
            <Box sx={styles.formWrapper}>
               <Formik
                  initialValues={initialValues}
                  validationSchema={schema}
                  onSubmit={handleSubmit}
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
                     <form id="resetPasswordForm" onSubmit={handleSubmit}>
                        <Box sx={styles.headerWrapper}>
                           <MicIcon
                              fontSize="large"
                              style={styles.icon}
                              color="disabled"
                           />
                           <ArrowForwardIosIcon
                              fontSize="large"
                              style={styles.icon}
                              color="disabled"
                           />
                           <BusinessCenterIcon
                              fontSize="large"
                              style={styles.icon}
                              color="disabled"
                           />
                        </Box>
                        <Box sx={styles.formTitle}>CareerFairy</Box>
                        <TextField
                           required
                           name="email"
                           id="email"
                           placeholder="Email"
                           onBlur={handleBlur}
                           onChange={handleChange}
                           value={values.email}
                           disabled={isSubmitting}
                           label="Email"
                           variant="outlined"
                           className="registrationInput"
                           fullWidth
                           error={Boolean(errors.email && touched.email)}
                        />
                        <Collapse
                           in={Boolean(
                              errors.email && touched.email && errors.email
                           )}
                        >
                           <FormHelperText error>
                              {/* @ts-ignore */}
                              {errors.email}
                           </FormHelperText>
                        </Collapse>

                        <Button
                           type="submit"
                           data-testid={"password-reset-button"}
                           sx={{ mt: 2 }}
                           disabled={isSubmitting}
                           startIcon={
                              isSubmitting && (
                                 <CircularProgress
                                    color={"inherit"}
                                    size={15}
                                 />
                              )
                           }
                           color="primary"
                           variant="contained"
                           fullWidth
                        >
                           Reset Password
                        </Button>
                        <Collapse in={completed}>
                           <Paper variant="outlined" sx={{ p: 1, mt: 2 }}>
                              <Typography variant="h4" gutterBottom>
                                 Done!
                              </Typography>
                              <Typography variant={"subtitle1"}>
                                 If {"you're"} email is registered, you will
                                 shortly receive an email to complete your
                                 password reset.
                              </Typography>
                           </Paper>
                        </Collapse>
                     </form>
                  )}
               </Formik>
            </Box>
            <Typography sx={styles.footerInfo}>Meet Your Future</Typography>
         </Container>
      </>
   )
}
