import React, { useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Formik, FormikValues } from "formik"
import Head from "next/head"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Collapse from "@mui/material/Collapse"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded"
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded"
import MicOutlinedIcon from "@mui/icons-material/MicOutlined"
import { useAuth } from "../HOCs/AuthProvider"
import { FormikHelpers } from "formik/dist/types"
import { MainLogo } from "../components/logos"
import { PillsBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import { HeaderLogoWrapper } from "../materialUI"
import { FormHelperText } from "@mui/material"
import * as yup from "yup"

const styles = {
   box: {
      width: "100%", // Fix IE 11 issue.
      marginTop: 3,
      p: 3,
   },
   submit: {
      margin: (theme) => theme.spacing(3, 0, 2),
   },
   footer: {
      fontWeight: "700",
      fontSize: "1.3em",
      margin: "40px 0 30px 0",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: "0.4em",
   },
   title: {
      color: "primary.main",
      fontWeight: "500",
      fontSize: "2em",
      margin: 3,
      textAlign: "center",
   },
   form: {
      width: "100%", // Fix IE 11 issue.
   },
   iconWrapper: {
      display: "flex",
      justifyContent: "center",
   },
   message: {
      color: "success.main",
      padding: "1rem",
      backgroundColor: "white",
      margin: "1rem 0",
   },
   logo: {
      margin: "20px 20px 0 20px",
   },
   icon: {
      margin: "0 10px",
   },
}

function LogInPage() {
   const { authenticatedUser, userData } = useAuth()
   const firebase = useFirebaseService()

   const {
      query: { absolutePath },
      replace,
   } = useRouter()

   useEffect(() => {
      if (
         authenticatedUser.isLoaded &&
         !authenticatedUser.isEmpty &&
         userData !== undefined
      ) {
         if (!firebase.auth?.currentUser?.emailVerified) {
            void replace(
               absolutePath
                  ? {
                       pathname: "/signup",
                       query: { absolutePath },
                    }
                  : "/signup"
            )
         } else {
            void replace((absolutePath as string) || "/portal")
         }
      }
   }, [
      authenticatedUser,
      absolutePath,
      userData,
      firebase.auth?.currentUser?.emailVerified,
   ])

   return (
      <PillsBackground>
         <HeaderLogoWrapper>
            <MainLogo sx={styles.logo} />
         </HeaderLogoWrapper>
         <LogInFormBase />
      </PillsBackground>
   )
}

export default LogInPage

const schema = yup.object().shape({
   email: yup
      .string()
      .required("Your email is required")
      .email("Please enter a valid email address"),
   password: yup.string().required("A password is required"),
})

export function LogInFormBase() {
   const firebase = useFirebaseService()
   const {
      query: { absolutePath },
   } = useRouter()
   const handleSubmit = async (
      values: FormikValues,
      helpers: FormikHelpers<FormikValues>
   ) => {
      try {
         await firebase.signInWithEmailAndPassword(
            values.email,
            values.password
         )
         helpers.setErrors({})
      } catch (error) {
         switch (error.code) {
            case "auth/wrong-password":
               return helpers.setFieldError(
                  "submitError",
                  "Your password or email is invalid."
               )
            case "auth/user-not-found":
               return helpers.setFieldError(
                  "submitError",
                  "No account associated with this email address."
               )
            default:
               helpers.setFieldError(
                  "submitError",
                  "An error occurred while logging in to your account."
               )
         }
      }
      helpers.setSubmitting(false)
   }

   return (
      <>
         <Head>
            <title key="title">CareerFairy | Log in</title>
         </Head>
         <Formik
            initialValues={{ email: "", password: "" }}
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
               <Container maxWidth="sm">
                  <Box sx={styles.box}>
                     <Box
                        component={"form"}
                        sx={styles.form}
                        onSubmit={handleSubmit}
                     >
                        <Box sx={styles.iconWrapper}>
                           <MicOutlinedIcon
                              color="disabled"
                              fontSize="large"
                              style={styles.icon}
                           />
                           <BusinessCenterRoundedIcon
                              color="disabled"
                              fontSize="large"
                              style={styles.icon}
                           />
                           <TheatersRoundedIcon
                              color="disabled"
                              fontSize="large"
                              style={styles.icon}
                           />
                        </Box>
                        <Typography sx={styles.title}>CareerFairy</Typography>
                        <TextField
                           className="registrationInput"
                           label="Email"
                           id="email"
                           name="email"
                           fullWidth
                           margin="normal"
                           variant="outlined"
                           placeholder="Email Address"
                           autoComplete="email"
                           onChange={handleChange}
                           onBlur={handleBlur}
                           value={values.email}
                           error={Boolean(errors.email && touched.email)}
                           disabled={isSubmitting}
                        />
                        <Collapse in={Boolean(errors.email && touched.email)}>
                           <FormHelperText error>{errors.email}</FormHelperText>
                        </Collapse>
                        <TextField
                           className="registrationInput"
                           id="password"
                           type="password"
                           fullWidth
                           variant="outlined"
                           margin="normal"
                           label="Password"
                           name="password"
                           autoComplete="current-password"
                           placeholder="Password"
                           onChange={handleChange}
                           onBlur={handleBlur}
                           value={values.password}
                           disabled={isSubmitting}
                           error={Boolean(errors.password && touched.password)}
                        />
                        <Collapse
                           in={Boolean(errors.password && touched.password)}
                        >
                           <FormHelperText error>
                              {errors.password}
                           </FormHelperText>
                        </Collapse>
                        <Button
                           id="submitButton"
                           data-testid={"login-button"}
                           color="primary"
                           sx={styles.submit}
                           size="large"
                           variant="contained"
                           type="submit"
                           fullWidth
                           disabled={isSubmitting}
                           endIcon={
                              isSubmitting && (
                                 <CircularProgress size={20} color="inherit" />
                              )
                           }
                        >
                           Log in
                        </Button>
                        <Grid style={{ marginBottom: "1rem" }} container>
                           <Grid item xs>
                              <Link href="/reset-password">
                                 <a data-testid="forgot-password-page-link">
                                    Forgot password?
                                 </a>
                              </Link>
                           </Grid>
                           <Grid item>
                              New to career streaming?
                              <Link
                                 href={
                                    absolutePath
                                       ? {
                                            pathname: "/signup",
                                            query: { absolutePath },
                                         }
                                       : "/signup"
                                 }
                              >
                                 <a data-testid="signup-page-link"> Sign up</a>
                              </Link>
                           </Grid>
                        </Grid>
                        <Collapse in={Boolean(errors.submitError)}>
                           <Typography
                              gutterBottom
                              variant="subtitle1"
                              align="center"
                              color="error"
                           >
                              {errors.submitError}
                           </Typography>
                        </Collapse>
                     </Box>
                  </Box>
               </Container>
            )}
         </Formik>
         <Typography sx={styles.footer}>Meet Your Future</Typography>
      </>
   )
}
