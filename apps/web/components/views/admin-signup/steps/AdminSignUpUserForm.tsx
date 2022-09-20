import { useRouter } from "next/router"
import React, { Fragment, useContext } from "react"
import { Formik } from "formik"
import {
   Box,
   Button,
   Checkbox,
   CircularProgress,
   Collapse,
   FormControl,
   FormControlLabel,
   FormHelperText,
   Grid,
   TextField,
   Typography,
} from "@mui/material"
import Link from "next/link"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import * as yup from "yup"
import {
   IMultiStepContext,
   MultiStepContext,
} from "../../common/MultiStepWrapper"
import { sxStyles } from "../../../../types/commonTypes"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { FormikHelpers } from "formik/dist/types"

const styles = sxStyles({
   submit: {
      margin: (theme) => theme.spacing(3, 0, 2),
   },
   resetEmail: {
      margin: "20px auto 0 auto",
      textAlign: "center",
   },
   subtitle: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})

export interface IAdminUserCreateFormValues
   extends Pick<UserData, "firstName" | "lastName"> {
   email: string
   password: string
   confirmPassword: string
   agreeTerm: boolean
   subscribed?: boolean
}

const schema: yup.SchemaOf<IAdminUserCreateFormValues> = yup.object().shape({
   email: yup
      .string()
      .trim()
      .required("Your email is required")
      .email("Please enter a valid email address"),
   firstName: yup
      .string()
      .required("Your first name is required")
      .max(50, "Cannot be longer than 50 characters")
      .matches(/^\D+$/i, "Please enter a valid first name"),
   lastName: yup
      .string()
      .required("Your last name is required")
      .max(50, "Cannot be longer than 50 characters")
      .matches(/^\D+$/i, "Please enter a valid last name"),
   password: yup
      .string()
      .required("A password is required")
      .matches(
         /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
         "Your password needs to be at least 6 characters long and contain at least one uppercase character, one lowercase character and one number"
      ),
   confirmPassword: yup
      .string()
      .required("You need to confirm your password")
      .oneOf(
         [yup.ref("password")],
         "Your password was not confirmed correctly"
      ),
   agreeTerm: yup
      .boolean()
      .oneOf([true], "Please agree to our T&C and our Privacy Policy"),
   subscribed: yup.boolean(),
})

const initValues: IAdminUserCreateFormValues = {
   firstName: "",
   lastName: "",
   email: "",
   password: "",
   confirmPassword: "",
   agreeTerm: false,
   subscribed: false,
}

const demoGroupId = "rTUGXDAG2XAtpVcgvAcc!"

function AdminSignUpUserForm() {
   const firebase = useFirebaseService()
   const {
      query: { absolutePath },
   } = useRouter()
   const { setCurrentStep } = useContext<IMultiStepContext>(MultiStepContext)

   const handleSubmit = async (
      values: IAdminUserCreateFormValues,
      { setFieldError }: FormikHelpers<IAdminUserCreateFormValues>
   ) => {
      try {
         setFieldError("general", null) // reset the general error

         /*
          * 1. Create a new user
          * 2. Grant them a group admin claim
          * 3. Send them an email to verify their email address
          * */
         await firebase.createGroupAdminUserInAuthAndFirebase({
            groupId: demoGroupId,
            userData: values,
         })

         /*
          * At this step, the initial user has been created and the group admin claim has been assigned
          * So once signed in, they will already have the group admin claim
          * */
         await firebase.signInWithEmailAndPassword(
            values.email,
            values.password
         )

         return setCurrentStep(1) // Ensure the user goes to the pin validation step
      } catch (e) {
         setFieldError("general", e.message)
      }
   }

   return (
      <Fragment>
         <Formik
            enableReinitialize={true}
            initialValues={initValues}
            validationSchema={schema}
            onSubmit={handleSubmit}
            initialErrors={{
               general: null,
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
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <Typography sx={styles.subtitle} variant="h5">
                           Personal Info
                        </Typography>
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                           <TextField
                              className="registrationInput"
                              autoComplete="given-name"
                              name="firstName"
                              variant="outlined"
                              fullWidth
                              id="firstName"
                              label="First Name"
                              autoFocus
                              inputProps={{
                                 maxLength: 50,
                              }}
                              onBlur={handleBlur}
                              value={values.firstName}
                              disabled={isSubmitting}
                              error={Boolean(
                                 errors.firstName &&
                                    touched.firstName &&
                                    errors.firstName
                              )}
                              onChange={handleChange}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.firstName &&
                                    touched.firstName &&
                                    errors.firstName
                              )}
                           >
                              <FormHelperText error>
                                 {errors.firstName}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                           <TextField
                              className="registrationInput"
                              variant="outlined"
                              fullWidth
                              id="lastName"
                              inputProps={{ maxLength: 50 }}
                              label="Last Name"
                              name="lastName"
                              autoComplete="family-name"
                              onBlur={handleBlur}
                              disabled={isSubmitting}
                              value={values.lastName}
                              error={Boolean(
                                 errors.lastName &&
                                    touched.lastName &&
                                    errors.lastName
                              )}
                              onChange={handleChange}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.lastName &&
                                    touched.lastName &&
                                    errors.lastName
                              )}
                           >
                              <FormHelperText error>
                                 {errors.lastName}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12}>
                        <FormControl fullWidth>
                           <TextField
                              className="registrationInput"
                              variant="outlined"
                              fullWidth
                              error={Boolean(errors.email && touched.email)}
                              autoComplete="email"
                              id="emailInput"
                              name="email"
                              placeholder="Email"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.email}
                              disabled={isSubmitting}
                              label="Email Address"
                           />
                           <Collapse
                              in={Boolean(
                                 errors.email && touched.email && errors.email
                              )}
                           >
                              <FormHelperText error>
                                 {errors.email}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                           <TextField
                              className="registrationInput"
                              variant="outlined"
                              fullWidth
                              label="Password"
                              id="password"
                              autoComplete="current-password"
                              type="password"
                              name="password"
                              error={Boolean(
                                 errors.password &&
                                    touched.password &&
                                    errors.password
                              )}
                              placeholder="Password"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.password}
                              disabled={isSubmitting}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.password &&
                                    touched.password &&
                                    errors.password
                              )}
                           >
                              <FormHelperText error>
                                 {errors.password}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                           <TextField
                              className="registrationInput"
                              variant="outlined"
                              fullWidth
                              label="Confirm Password"
                              autoComplete="current-password"
                              id="confirmPasswordInput"
                              type="password"
                              error={Boolean(
                                 errors.confirmPassword &&
                                    touched.confirmPassword &&
                                    errors.confirmPassword
                              )}
                              name="confirmPassword"
                              placeholder="Confirm Password"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.confirmPassword}
                              disabled={isSubmitting}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.confirmPassword &&
                                    touched.confirmPassword &&
                                    errors.confirmPassword
                              )}
                           >
                              <FormHelperText error>
                                 {errors.confirmPassword}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Grid>
                     <Grid item xs={12}>
                        <FormControlLabel
                           control={
                              <Checkbox
                                 name="agreeTerm"
                                 placeholder="Confirm Password"
                                 onChange={handleChange}
                                 onBlur={handleBlur}
                                 checked={values.agreeTerm}
                                 disabled={isSubmitting}
                                 color="primary"
                              />
                           }
                           label={
                              <Typography style={{ fontSize: 12 }}>
                                 I agree to the{" "}
                                 <Link href="/terms">
                                    <a>Terms & Conditions</a>
                                 </Link>{" "}
                                 and I have taken note of the{" "}
                                 <Link href="/privacy">
                                    <a>Data Protection Notice</a>
                                 </Link>
                              </Typography>
                           }
                        />
                        <Collapse
                           in={Boolean(errors.agreeTerm && touched.agreeTerm)}
                        >
                           <FormHelperText error>
                              {errors.agreeTerm}
                           </FormHelperText>
                        </Collapse>
                     </Grid>
                     <Grid item xs={12}>
                        <FormControlLabel
                           control={
                              <Checkbox
                                 name="subscribed"
                                 onChange={handleChange}
                                 onBlur={handleBlur}
                                 checked={values.subscribed}
                                 disabled={isSubmitting}
                                 color="primary"
                              />
                           }
                           label={
                              <Typography style={{ fontSize: 12 }}>
                                 I don’t want to miss out on events from
                                 exciting companies and would like to receive
                                 occasional email announcements from
                                 CareerFairy. 🚀
                              </Typography>
                           }
                        />
                     </Grid>
                  </Grid>
                  {/*@ts-ignore*/}
                  <FormHelperText error hidden={!errors.general}>
                     {/*@ts-ignore*/}
                     <Box mt={3}>{errors.general}</Box>
                  </FormHelperText>
                  <Button
                     type="submit"
                     fullWidth
                     size="large"
                     variant="contained"
                     data-testid={"signup-button"}
                     color="primary"
                     disabled={isSubmitting}
                     endIcon={
                        isSubmitting && (
                           <CircularProgress size={20} color="inherit" />
                        )
                     }
                     sx={styles.submit}
                  >
                     Sign up
                  </Button>
                  <Box sx={styles.resetEmail}>
                     <div style={{ marginBottom: "5px" }}>
                        Already part of the family?
                     </div>
                     <Link
                        href={
                           absolutePath
                              ? {
                                   pathname: "/login",
                                   query: { absolutePath },
                                }
                              : "/login"
                        }
                     >
                        <a href="#">Log in</a>
                     </Link>
                  </Box>
                  <Box sx={styles.resetEmail}>
                     <div style={{ marginBottom: "5px" }}>
                        Having issues signing up?
                        <a
                           style={{ marginLeft: "5px" }}
                           href="mailto:maximilian@careerfairy.io"
                        >
                           Let us know
                        </a>
                     </div>
                  </Box>
               </form>
            )}
         </Formik>
      </Fragment>
   )
}

export default AdminSignUpUserForm
