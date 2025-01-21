import { possibleGenders } from "@careerfairy/shared-lib/constants/forms"
import { MESSAGING_TYPE, USER_AUTH } from "@careerfairy/shared-lib/messaging"
import {
   IUserReminder,
   UserAccountCreationAdditionalData,
   UserData,
   UserReminderType,
} from "@careerfairy/shared-lib/users"
import {
   Box,
   Button,
   Checkbox,
   CircularProgress,
   FormControlLabel,
   FormHelperText,
   Grid,
   Typography,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { Formik } from "formik"
import { DateTime } from "luxon"
import { useRouter } from "next/router"
import React, { Fragment, useContext, useEffect, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import * as yup from "yup"
import { userRepo } from "../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../types/commonTypes"
import CookiesUtil from "../../../../util/CookiesUtil"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { MobileUtils } from "../../../../util/mobile.utils"
import GenericDropdown from "../../common/GenericDropdown"
import {
   IMultiStepContext,
   MultiStepContext,
} from "../../common/MultiStepWrapper"
import UniversityCountrySelector from "../../universitySelect/UniversityCountrySelector"
import UniversitySelector from "../../universitySelect/UniversitySelector"
import HelperHint from "../common/HelperHint"
import { signupSchema } from "../schemas"
import Email from "../userInformation/Email"
import { FieldOfStudySelector } from "../userInformation/FieldOfStudySelector"
import FirstName from "../userInformation/FirstName"
import LastName from "../userInformation/LastName"
import { LevelOfStudySelector } from "../userInformation/LevelOfStudySelector"
import Password from "../userInformation/Password"
import PasswordRepeat from "../userInformation/PasswordRepeat"
import TermsAgreement from "../userInformation/TermsAgreement"

const styles = sxStyles({
   submit: {
      margin: (theme) => theme.spacing(3, 0, 2),
   },
   subtitle: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
   datePicker: {
      width: "100%",
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: "8px",
      boxShadow: "0px 5px 15px 0px #BDBDBD",
      "& .MuiOutlinedInput-notchedOutline": {
         border: "none",
      },
   },
})

interface IFormValues
   extends Pick<
      UserData,
      | "firstName"
      | "lastName"
      | "fieldOfStudy"
      | "levelOfStudy"
      | "universityCountryCode"
      | "gender"
   > {
   email: string
   password: string
   confirmPassword: string
   agreeTerm: boolean
   subscribed?: boolean
   gender?: string
   university: {
      name: string
      code: string
   }
   startedAt: Date
   endedAt: Date
}

const schema: yup.SchemaOf<IFormValues> = yup.object().shape(signupSchema)

const initValues: IFormValues = {
   firstName: "",
   lastName: "",
   email: "",
   password: "",
   confirmPassword: "",
   agreeTerm: false,
   subscribed: false,
   university: { code: "other", name: "Other" },
   universityCountryCode: "",
   gender: "",
   fieldOfStudy: null,
   levelOfStudy: null,
   startedAt: null, // Study background
   endedAt: null, // Study background
}

function SignUpUserForm() {
   const firebase = useFirebaseService()
   const { push } = useRouter()
   const { setCurrentStep } = useContext<IMultiStepContext>(MultiStepContext)
   const { talentProfileV1 } = useFeatureFlags()
   const [emailSent, setEmailSent] = useState(false)
   const [errorMessage, setErrorMessage] = useState(null)
   const [generalLoading, setGeneralLoading] = useState(false)
   const [open, setOpen] = React.useState(false)

   useEffect(() => {
      dataLayerEvent("signup_started")
   }, [])

   const submitting = (isSubmitting) => {
      return isSubmitting || emailSent || generalLoading
   }

   const handleClose = () => {
      setOpen(false)
   }

   const handleOpen = () => {
      setOpen(true)
   }

   const handleSubmit = (values, { setSubmitting }) => {
      setErrorMessage(null)
      setEmailSent(false)
      setGeneralLoading(true)

      const valuesWithUtmParams = {
         ...values,
         accountCreationUTMParams: CookiesUtil.getUTMParams() ?? {},
      }

      const additionalData: UserAccountCreationAdditionalData = {
         studyBackground: {
            authId: null, // At the moment there is not user auth, this will be set on the backend after user creation
            id: null,
            fieldOfStudy: values.fieldOfStudy,
            levelOfStudy: values.levelOfStudy,
            universityCountryCode: values.universityCountryCode,
            universityId: values.university.code,
            startedAt: values.startedAt ? new Date(values.startedAt) : null,
            endedAt: values.endedAt ? new Date(values.endedAt) : null,
         },
      }

      firebase
         .createUserInAuthAndFirebase(valuesWithUtmParams, additionalData)
         .then(() => {
            firebase
               .signInWithEmailAndPassword(values.email, values.password)
               .then(async (userCred) => {
                  // To create a newsletter reminder for 7 days in the future
                  // in case the subscribed input is not checked
                  try {
                     if (values.subscribed) {
                        dataLayerEvent("newsletter_accepted_on_signup")
                        return
                     }

                     dataLayerEvent("newsletter_denied_on_signup")

                     const sevenDaysFromNow = new Date(
                        new Date().setDate(new Date().getDate() + 7)
                     )

                     const reminder = {
                        complete: false,
                        notBeforeThan: sevenDaysFromNow,
                        type: UserReminderType.NewsletterReminder,
                        isFirstReminder: true,
                     } as IUserReminder

                     const token =
                        userCred.user.multiFactor["user"].accessToken || ""
                     MobileUtils.send<USER_AUTH>(MESSAGING_TYPE.USER_AUTH, {
                        token,
                        userId: values.email,
                        userPassword: values.password,
                     })
                     await userRepo.updateUserReminder(values.email, reminder)
                  } catch (e) {
                     errorLogAndNotify(e, {
                        message: "Error updating user reminder",
                        email: values.email,
                     })
                  }
               })
               .then(() => {
                  setSubmitting(false)
                  setGeneralLoading(false)

                  // we need to force the next step to be 1 (pin validation) instead of nextStep()
                  // because there is a race condition with a useEffect in signup.txt:58
                  // the useEffect moves to the step 1 because the user is logged in but not confirmed
                  // if we would do nextStep() here, it would move to step 2 instead of 1
                  setCurrentStep(1)
                  dataLayerEvent("signup_credentials_completed")
               })
               .catch((e) => {
                  errorLogAndNotify(e, {
                     message: "Error signing in with email and password",
                     email: values.email,
                  })
                  void push("/login")
               })
         })
         .catch((error) => {
            errorLogAndNotify(error, {
               message: "Error creating user in Auth and Firebase",
               email: values.email,
            })
            setErrorMessage(error)
            setGeneralLoading(false)
            setSubmitting(false)
         })
   }

   return (
      <Fragment>
         <Formik
            enableReinitialize={true}
            initialValues={initValues}
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
               setFieldValue,
               isSubmitting,
               setFieldError,
               /* and other goodies */
            }) => (
               <form id="signUpForm" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <Typography sx={styles.subtitle} variant="h5">
                           Personal Info
                        </Typography>
                     </Grid>
                     <Grid item xs={12} sm={6} md={4}>
                        <FirstName
                           value={values.firstName}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.firstName}
                           disabled={submitting(isSubmitting)}
                           touched={touched.firstName}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6} md={4}>
                        <LastName
                           value={values.lastName}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.lastName}
                           disabled={submitting(isSubmitting)}
                           touched={touched.lastName}
                        />
                     </Grid>
                     <Grid item xs={12} sm={12} md={4}>
                        <GenericDropdown
                           id="gender-dropdown"
                           name="gender"
                           onChange={handleChange}
                           value={values.gender}
                           label="Gender"
                           list={possibleGenders}
                           className="registrationDropdown"
                        />
                     </Grid>
                     <Grid item xs={12}>
                        <Email
                           value={values.email}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.email}
                           disabled={submitting(isSubmitting)}
                           touched={touched.email}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <Password
                           value={values.password}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.password}
                           disabled={submitting(isSubmitting)}
                           touched={touched.password}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <PasswordRepeat
                           value={values.confirmPassword}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.confirmPassword}
                           disabled={submitting(isSubmitting)}
                           touched={touched.confirmPassword}
                        />
                     </Grid>
                     <Grid item xs={12}>
                        <Typography sx={styles.subtitle} variant="h5">
                           University
                        </Typography>
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <UniversityCountrySelector
                           className="registrationInput"
                           value={values.universityCountryCode}
                           handleClose={handleClose}
                           submitting={submitting(isSubmitting)}
                           setFieldValue={setFieldValue}
                           error={
                              errors.universityCountryCode &&
                              touched.universityCountryCode
                                 ? errors.universityCountryCode
                                 : null
                           }
                           handleOpen={handleOpen}
                           open={open}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <UniversitySelector
                           className="registrationInput"
                           error={
                              errors.university && touched.university
                                 ? errors.university
                                 : null
                           }
                           universityCountryCode={values.universityCountryCode}
                           values={values}
                           submitting={submitting(isSubmitting)}
                           setFieldValue={setFieldValue}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <FieldOfStudySelector
                           setFieldValue={setFieldValue}
                           value={values.fieldOfStudy}
                           className="registrationInput"
                           disabled={submitting(isSubmitting)}
                           error={
                              errors.fieldOfStudy && touched.fieldOfStudy
                                 ? errors.fieldOfStudy
                                 : null
                           }
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <LevelOfStudySelector
                           setFieldValue={setFieldValue}
                           value={values.levelOfStudy}
                           className="registrationInput"
                           disabled={submitting(isSubmitting)}
                           error={
                              errors.levelOfStudy && touched.levelOfStudy
                                 ? errors.levelOfStudy
                                 : null
                           }
                        />
                     </Grid>

                     {talentProfileV1 ? (
                        <>
                           <Grid item xs={12} sm={6}>
                              <Box>
                                 <DatePicker
                                    sx={styles.datePicker}
                                    value={values.startedAt}
                                    views={["year", "month"]}
                                    label="Start date"
                                    onChange={(date) => {
                                       setFieldValue("startedAt", date, true)
                                       if (
                                          date &&
                                          values.endedAt &&
                                          date >
                                             DateTime.fromJSDate(values.endedAt)
                                                .minus({ months: 1 })
                                                .toJSDate()
                                       ) {
                                          setFieldError(
                                             "endedAt",
                                             "Ended at cannot be before started at"
                                          )
                                       }
                                    }}
                                    disabled={submitting(isSubmitting)}
                                 />
                              </Box>
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <Box>
                                 <DatePicker
                                    sx={styles.datePicker}
                                    value={values.endedAt}
                                    onChange={(date) => {
                                       setFieldValue("endedAt", date, true)
                                    }}
                                    onError={(error) => {
                                       switch (error) {
                                          case "minDate": {
                                             setFieldError(
                                                "endedAt",
                                                "Ended at cannot be before started at"
                                             )
                                             break
                                          }

                                          case "invalidDate": {
                                             setFieldError(
                                                "endedAt",
                                                "Ended at is not valid"
                                             )
                                             break
                                          }

                                          default: {
                                             setFieldError("endedAt", "")
                                             break
                                          }
                                       }
                                    }}
                                    disabled={
                                       !values.startedAt ||
                                       submitting(isSubmitting)
                                    }
                                    views={["year", "month"]}
                                    label="End date (or expected)"
                                    minDate={DateTime.fromJSDate(
                                       values.startedAt
                                    )
                                       .plus({ months: 1 })
                                       .toJSDate()}
                                 />
                                 {errors.endedAt ? (
                                    <FormHelperText sx={{ ml: "16px" }} error>
                                       {errors.endedAt.toString()}
                                    </FormHelperText>
                                 ) : null}
                              </Box>
                           </Grid>
                        </>
                     ) : null}
                     <Grid item xs={12}>
                        <TermsAgreement
                           onChange={handleChange}
                           value={values.agreeTerm}
                           disabled={submitting(isSubmitting)}
                           touched={touched.agreeTerm}
                           error={errors.agreeTerm}
                           onBlur={handleBlur}
                        />
                     </Grid>
                     <Grid item xs={12}>
                        <FormControlLabel
                           control={
                              <Checkbox
                                 name="subscribed"
                                 onChange={handleChange}
                                 onBlur={handleBlur}
                                 checked={values.subscribed}
                                 disabled={submitting(isSubmitting)}
                                 color="primary"
                              />
                           }
                           label={
                              <Typography style={{ fontSize: 12 }}>
                                 Join <b>60’000+ students and graduates</b> who
                                 receive personalised invitations to career
                                 events and job openings 👍
                              </Typography>
                           }
                        />
                     </Grid>
                  </Grid>
                  <FormHelperText error hidden={!errorMessage}>
                     <Box mt={3}>{errorMessage?.message}</Box>
                  </FormHelperText>
                  <Button
                     type="submit"
                     fullWidth
                     size="large"
                     variant="contained"
                     data-testid={"signup-button"}
                     color="primary"
                     disabled={isSubmitting || emailSent}
                     endIcon={
                        isSubmitting || generalLoading ? (
                           <CircularProgress size={20} color="inherit" />
                        ) : null
                     }
                     sx={styles.submit}
                  >
                     Sign up
                  </Button>
                  <HelperHint />
               </form>
            )}
         </Formik>
      </Fragment>
   )
}

export default SignUpUserForm
