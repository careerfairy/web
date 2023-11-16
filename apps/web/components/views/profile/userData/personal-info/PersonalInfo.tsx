import React, { useCallback, useEffect, useState } from "react"
import { Formik } from "formik"

import { withFirebase } from "context/firebase/FirebaseServiceContext"
import {
   Typography,
   TextField,
   Button,
   Grid,
   CircularProgress,
   Collapse,
   FormHelperText,
   FormControl,
   Checkbox,
   FormControlLabel,
} from "@mui/material"
import UniversityCountrySelector from "components/views/universitySelect/UniversityCountrySelector"
import UniversitySelector from "components/views/universitySelect/UniversitySelector"
import { GENERAL_ERROR, URL_REGEX } from "components/util/constants"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import { useSnackbar } from "notistack"
import { NetworkerBadge } from "@careerfairy/shared-lib/dist/badges/NetworkBadges"
import BadgeSimpleButton from "../../BadgeSimpleButton"
import ContentCardTitle from "../../../../../layouts/UserLayout/ContentCardTitle"
import { StylesProps } from "../../../../../types/commonTypes"
import { useRouter } from "next/router"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { FieldOfStudySelector } from "../../../signup/userInformation/FieldOfStudySelector"
import { LevelOfStudySelector } from "../../../signup/userInformation/LevelOfStudySelector"

const styles: StylesProps = {
   avatar: {
      margin: 1,
      backgroundColor: (theme) => theme.palette.secondary.main,
   },
   submit: {
      margin: (theme) => theme.spacing(3, 0, 2),
      marginBottom: 0,
   },
   title: {
      textTransform: "uppercase",
      fontSize: "1.8rem",
      marginBottom: 3,
   },
   subtitle: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
      marginBottom: 1,
   },
}

const PersonalInfo = ({ userData }) => {
   const { userPresenter } = useAuth()
   const [open, setOpen] = useState(false)
   const { enqueueSnackbar } = useSnackbar()
   const router = useRouter()
   const dispatch = useDispatch()
   // @ts-ignore
   const { loading, error } = useSelector((state) => state.auth.profileEdit)

   useEffect(() => {
      if (loading === false && error === false) {
         enqueueSnackbar("Your profile has been updated!", {
            variant: "success",
            preventDuplicate: true,
         })
      } else if (error) {
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         })
      }

      return () => {
         dispatch(actions.clean())
      }
   }, [loading, error])

   const handleClose = () => {
      setOpen(false)
   }

   const handleOpen = () => {
      setOpen(true)
   }

   const handleUpdate = async (values) => {
      await dispatch(actions.editUserProfile(values))
   }

   const navigateToReferrals = useCallback(() => {
      void router.push({
         pathname: "/profile/referrals",
      })

      return {} // match event handler signature
   }, [router])

   return (
      <Formik
         initialValues={{
            firstName: userData?.firstName || "",
            lastName: userData?.lastName || "",
            linkedinUrl:
               userData?.linkedinUrl || "" ? userData.linkedinUrl : "",
            university: userData?.university,
            universityCountryCode: userData?.universityCountryCode || "",
            unsubscribed: userData?.unsubscribed || false,
            fieldOfStudy: userData?.fieldOfStudy || null,
            levelOfStudy: userData?.levelOfStudy || null,
         }}
         enableReinitialize
         validate={(values) => {
            let errors: any = {}
            if (!values.firstName) {
               errors.firstName = "Required"
            } else if (!/^\D+$/i.test(values.firstName)) {
               errors.firstName = "Please enter a valid first name"
            } else if (values.firstName.length > 50) {
               errors.firstName = "Cannot be longer than 50 characters"
            }
            if (!values.lastName) {
               errors.lastName = "Required"
            } else if (!/^\D+$/i.test(values.lastName)) {
               errors.lastName = "Please enter a valid last name"
            } else if (values.lastName.length > 50) {
               errors.lastName = "Cannot be longer than 50 characters"
            }
            if (
               values.linkedinUrl.length > 0 &&
               !values.linkedinUrl.match(URL_REGEX)
            ) {
               errors.linkedinUrl = "Please enter a valid URL"
            }
            if (!values.universityCountryCode) {
               errors.universityCountryCode = "Please chose a country code"
            }
            if (!values.fieldOfStudy?.name || !values.fieldOfStudy?.id) {
               errors.fieldOfStudy = "Please select a field of study"
            }
            if (!values.levelOfStudy?.name || !values.levelOfStudy?.id) {
               errors.levelOfStudy = "Please select a level of study"
            }
            return errors
         }}
         onSubmit={handleUpdate}
      >
         {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            dirty,
            setFieldValue,
            isSubmitting,
            /* and other goodies */
         }) =>
            userData ? (
               <form onSubmit={handleSubmit}>
                  <>
                     <Grid container spacing={2}>
                        <Grid item xs={8}>
                           <ContentCardTitle sx={styles.title}>
                              Personal Info
                           </ContentCardTitle>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: "right" }}>
                           <BadgeSimpleButton
                              badge={NetworkerBadge}
                              isActive={Boolean(
                                 userPresenter?.badges?.networkerBadge()
                              )}
                              onClick={navigateToReferrals}
                           />
                        </Grid>
                     </Grid>
                     <Grid container spacing={2}>
                        <Grid item xs={12}>
                           <TextField
                              variant="outlined"
                              disabled
                              value={userData.id}
                              fullWidth
                              id="email"
                              label="Email Address"
                              name="email"
                           />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                           <FormControl fullWidth>
                              <TextField
                                 autoComplete="fname"
                                 name="firstName"
                                 variant="outlined"
                                 required
                                 fullWidth
                                 id="firstName"
                                 label="First Name"
                                 disabled={isSubmitting}
                                 onBlur={handleBlur}
                                 value={values.firstName}
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
                                    {/* @ts-ignore */}
                                    {errors.firstName}
                                 </FormHelperText>
                              </Collapse>
                           </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                           <FormControl fullWidth>
                              <TextField
                                 variant="outlined"
                                 required
                                 fullWidth
                                 id="lastName"
                                 label="Last Name"
                                 name="lastName"
                                 autoComplete="lname"
                                 disabled={isSubmitting}
                                 onBlur={handleBlur}
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
                                    {/* @ts-ignore */}
                                    {errors.lastName}
                                 </FormHelperText>
                              </Collapse>
                           </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                           <Typography sx={styles.subtitle} variant="h5">
                              University
                           </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                           <UniversityCountrySelector
                              value={values.universityCountryCode}
                              handleClose={handleClose}
                              submitting={isSubmitting}
                              setFieldValue={setFieldValue}
                              error={
                                 errors.universityCountryCode &&
                                 touched.universityCountryCode &&
                                 errors.universityCountryCode
                              }
                              handleOpen={handleOpen}
                              open={open}
                           />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                           <UniversitySelector
                              error={
                                 errors.university &&
                                 touched.university &&
                                 errors.university
                              }
                              universityCountryCode={
                                 values.universityCountryCode
                              }
                              values={values}
                              submitting={isSubmitting}
                              setFieldValue={setFieldValue}
                           />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                           <FieldOfStudySelector
                              setFieldValue={setFieldValue}
                              value={values.fieldOfStudy}
                              disabled={isSubmitting}
                              error={
                                 errors.fieldOfStudy &&
                                 touched.fieldOfStudy &&
                                 errors.fieldOfStudy
                              }
                           />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                           <LevelOfStudySelector
                              setFieldValue={setFieldValue}
                              value={values.levelOfStudy}
                              disabled={isSubmitting}
                              error={
                                 errors.levelOfStudy &&
                                 touched.levelOfStudy &&
                                 errors.levelOfStudy
                              }
                           />
                        </Grid>
                        <Grid item xs={12}>
                           <Typography sx={styles.subtitle} variant="h5">
                              Social
                           </Typography>
                        </Grid>
                        <Grid item xs={12}>
                           <FormControl fullWidth>
                              <TextField
                                 variant="outlined"
                                 fullWidth
                                 id="linkedinUrl"
                                 label="LinkedIn (optional)"
                                 name="linkedinUrl"
                                 autoComplete="lname"
                                 placeholder="https://www.linkedin.com/in/username/"
                                 disabled={isSubmitting}
                                 onBlur={handleBlur}
                                 value={values.linkedinUrl}
                                 error={Boolean(
                                    errors.linkedinUrl &&
                                       touched.linkedinUrl &&
                                       errors.linkedinUrl
                                 )}
                                 onChange={handleChange}
                              />
                              <Collapse
                                 in={Boolean(
                                    errors.linkedinUrl &&
                                       touched.linkedinUrl &&
                                       errors.linkedinUrl
                                 )}
                              >
                                 <FormHelperText error>
                                    {/* @ts-ignore */}
                                    {errors.linkedinUrl}
                                 </FormHelperText>
                              </Collapse>
                           </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                           <Typography sx={styles.subtitle} variant="h5">
                              Newsletter
                           </Typography>
                        </Grid>
                        <Grid item xs={12}>
                           <FormControl fullWidth>
                              <FormControlLabel
                                 control={
                                    <Checkbox
                                       checked={!values.unsubscribed}
                                       onBlur={handleBlur}
                                       onChange={(event) => {
                                          setFieldValue(
                                             "unsubscribed",
                                             !event.target.checked
                                          )
                                       }}
                                       name="unsubscribed"
                                    />
                                 }
                                 label={
                                    <Typography>
                                       I want to join <b>60’000+ students</b>{" "}
                                       who receive personalised invitations to
                                       career events and job openings 👍
                                    </Typography>
                                 }
                              />
                           </FormControl>
                        </Grid>
                     </Grid>
                     <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || !dirty}
                        startIcon={
                           isSubmitting && (
                              <CircularProgress size={20} color="inherit" />
                           )
                        }
                        sx={styles.submit}
                     >
                        {isSubmitting ? "Updating" : "Update"}
                     </Button>
                  </>
               </form>
            ) : null
         }
      </Formik>
   )
}

export default withFirebase(PersonalInfo)
