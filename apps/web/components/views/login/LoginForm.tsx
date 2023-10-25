import * as yup from "yup"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useState } from "react"
import { Formik, FormikValues } from "formik"
import { FormikHelpers } from "formik/dist/types"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import MicOutlinedIcon from "@mui/icons-material/MicOutlined"
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded"
import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Collapse from "@mui/material/Collapse"
import { FormHelperText } from "@mui/material"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import Link from "next/link"
import { dataLayerEvent } from "../../../util/analyticsUtils"
import { errorLogAndNotify } from "util/CommonUtil"
import ManageCompaniesDialog from "../profile/my-groups/ManageCompaniesDialog"
import { BLACKLISTED_ABSOLUTE_PATHS } from "../../../constants/routes"

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
   icon: {
      margin: "0 10px",
   },
}

const schema = yup.object().shape({
   email: yup
      .string()
      .trim()
      .required("Your email is required")
      .email("Please enter a valid email address"),
   password: yup.string().required("A password is required"),
})

interface LoginFormProps {
   groupAdmin?: boolean
}

const LogInForm = ({ groupAdmin }: LoginFormProps) => {
   const signupPagePath = groupAdmin ? "/signup-admin" : "/signup"
   const { authenticatedUser, userData, adminGroups } = useAuth()
   const firebase = useFirebaseService()
   const [openManageCompaniesDialog, setOpenManageCompaniesDialog] =
      useState(false)

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
                       pathname: signupPagePath,
                       query: { absolutePath },
                    }
                  : signupPagePath
            )
         } else {
            if (
               absolutePath &&
               !BLACKLISTED_ABSOLUTE_PATHS.includes(absolutePath as string)
            ) {
               // If there is an absolute path that is not blacklisted, then it should be redirected to that path
               void replace(absolutePath as string)
            } else if (
               userData?.isAdmin ||
               Object.keys(adminGroups).length > 1
            ) {
               // open manage company dialog
               setOpenManageCompaniesDialog(true)
            } else if (Object.keys(adminGroups).length === 1) {
               // redirect to the group admin page
               const groupId = Object.keys(adminGroups)[0]

               void replace(`/group/${groupId}/admin`)
            } else if (absolutePath) {
               // It should only be redirected to the blacklisted absolute path as last resort
               void replace(absolutePath as string)
            } else {
               void replace("/portal")
            }
         }
      }
   }, [
      authenticatedUser,
      absolutePath,
      userData,
      firebase.auth?.currentUser?.emailVerified,
      adminGroups,
   ])

   const handleSubmit = useCallback(
      async (values: FormikValues, helpers: FormikHelpers<FormikValues>) => {
         try {
            await firebase.signInWithEmailAndPassword(
               values.email,
               values.password
            )
            helpers.setErrors({})
            dataLayerEvent("login_complete")
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
                  errorLogAndNotify(error)
            }
            dataLayerEvent("login_failed")
         }
         helpers.setSubmitting(false)
      },
      [firebase]
   )

   const handleAdminCloseDialog = useCallback(() => {
      setOpenManageCompaniesDialog(false)
      void replace("/portal")
   }, [replace])

   return (
      <>
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
                              isSubmitting ? (
                                 <CircularProgress size={20} color="inherit" />
                              ) : null
                           }
                        >
                           Log in
                        </Button>
                        <Grid style={{ marginBottom: "1rem" }} container>
                           <Grid item xs>
                              <Link
                                 href="/reset-password"
                                 data-testid="forgot-password-page-link"
                              >
                                 Forgot password?
                              </Link>
                           </Grid>
                           <Grid item>
                              New to career streaming?
                              <Link
                                 href={
                                    absolutePath
                                       ? {
                                            pathname: signupPagePath,
                                            query: { absolutePath },
                                         }
                                       : signupPagePath
                                 }
                                 data-testid="signup-page-link"
                              >
                                 Sign up
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
         {openManageCompaniesDialog ? (
            <ManageCompaniesDialog
               open={openManageCompaniesDialog}
               hideCloseDisabled={true}
               handleClose={handleAdminCloseDialog}
            />
         ) : null}
      </>
   )
}

export default LogInForm
