import React, { Fragment, useContext, useState } from "react"
import { Formik } from "formik"
import { reloadAuth } from "react-redux-firebase/lib/actions/auth"
import {
   Box,
   Button,
   CircularProgress,
   Collapse,
   FormHelperText,
   Link as MuiLink,
   Paper,
   TextField,
   Typography,
} from "@mui/material"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import * as yup from "yup"
import { useAuth } from "../../../../HOCs/AuthProvider"
import {
   IMultiStepContext,
   MultiStepContext,
} from "../../common/MultiStepWrapper"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { useDispatch } from "react-redux"

const schema = yup.object().shape({
   pinCode: yup
      .string()
      .required("A PIN code is required")
      .matches(
         /^[0-9]{4}$/,
         "The PIN code must be a number between 0 and 9999"
      ),
})

const SignUpPinForm = () => {
   const firebase = useFirebaseService()
   const [errorMessageShown] = useState(false)
   const [incorrectPin, setIncorrectPin] = useState(false)
   const [generalLoading, setGeneralLoading] = useState(false)
   const { authenticatedUser: user } = useAuth()
   const { nextStep } = useContext<IMultiStepContext>(MultiStepContext)
   const dispatch = useDispatch()

   async function resendVerificationEmail() {
      setGeneralLoading(true)
      try {
         await firebase.resendPostmarkEmailVerificationEmailWithPin({
            recipientEmail: user.email,
         })
         setIncorrectPin(false)
         setGeneralLoading(false)
      } catch (error) {
         console.error(error)
         setIncorrectPin(false)
         setGeneralLoading(false)
      }
   }

   const updateActiveStep = () => {
      setTimeout(() => {
         nextStep()
      }, 500)
   }

   const handleSubmit = async (values, { setSubmitting }) => {
      setIncorrectPin(false)
      const userInfo = {
         recipientEmail: user.email,
         pinCode: parseInt(values.pinCode),
      }
      try {
         await firebase.validateUserEmailWithPin(userInfo)

         // reload user auth on both redux state and firebase instance
         await firebase.auth.currentUser.reload()
         await reloadAuth(dispatch, firebase.app) // redux action

         updateActiveStep()
         dataLayerEvent("signup_pin_complete")
      } catch (error) {
         console.log("error", error)
         setIncorrectPin(true)
         setGeneralLoading(false)
         setSubmitting(false)
      }
      return
   }

   return (
      <Fragment>
         <Formik
            initialValues={{ pinCode: "" }}
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
               <form id="signUpForm" onSubmit={handleSubmit}>
                  <Paper
                     elevation={3}
                     style={{
                        color: "#2c662d",
                        padding: "1rem",
                        backgroundColor: "#fcfff5",
                        marginBottom: "0.5rem",
                     }}
                  >
                     <Typography variant="h6" gutterBottom>
                        Check your mailbox!
                     </Typography>
                     <p>
                        We have just sent you an email containing a 4-digit PIN
                        code. Please enter this code below to start your journey
                        on CareerFairy.{" "}
                        <MuiLink
                           style={{ cursor: "pointer" }}
                           underline="always"
                           onClick={() => resendVerificationEmail()}
                        >
                           Resend the email verification link to{" "}
                           <strong>{user.email}</strong>
                        </MuiLink>
                     </p>
                  </Paper>
                  <Box style={{ margin: "1rem 0" }}>
                     <TextField
                        className="registrationInput"
                        label="PIN Code"
                        placeholder="Enter the pin code"
                        variant="outlined"
                        id="pinCode"
                        name="pinCode"
                        fullWidth
                        inputProps={{ maxLength: 4 }}
                        disabled={isSubmitting || generalLoading}
                        value={values.pinCode}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(
                           errors.pinCode && touched.pinCode && errors.pinCode
                        )}
                     />
                     <Collapse
                        in={Boolean(
                           errors.pinCode && touched.pinCode && errors.pinCode
                        )}
                     >
                        <FormHelperText error>{errors.pinCode}</FormHelperText>
                     </Collapse>
                  </Box>
                  <Button
                     size="large"
                     type="submit"
                     fullWidth
                     data-testid={"validate-email-button"}
                     color="primary"
                     variant="contained"
                     disabled={isSubmitting || generalLoading}
                     endIcon={
                        (isSubmitting || generalLoading) && (
                           <CircularProgress color="inherit" size={20} />
                        )
                     }
                  >
                     {isSubmitting
                        ? "Checking"
                        : generalLoading
                        ? "Resending"
                        : "Validate Email"}
                  </Button>
                  {/* @ts-ignore */}
                  <Typography
                     style={{ marginTop: "0.5rem" }}
                     align="center"
                     hidden={!incorrectPin}
                     color="error"
                     margin="dense"
                  >
                     <strong>Incorrect PIN</strong> <br />
                     The PIN code you entered appears to be incorrect.{" "}
                     <MuiLink onClick={() => resendVerificationEmail()}>
                        <br />
                        Resend the verification email.
                     </MuiLink>
                  </Typography>
                  <div
                     style={{ margin: "20px auto 0 auto", textAlign: "center" }}
                  >
                     <div style={{ marginBottom: "5px" }}>
                        Having issues signing up?{" "}
                        <MuiLink
                           style={{ cursor: "pointer" }}
                           href="mailto:maximilian@careerfairy.io"
                        >
                           {" "}
                           Let us know
                        </MuiLink>
                     </div>
                  </div>
                  <Typography
                     align="center"
                     color="error"
                     hidden={!errorMessageShown}
                  >
                     An error occurred while creating to your account
                  </Typography>
               </form>
            )}
         </Formik>
      </Fragment>
   )
}

export default SignUpPinForm
