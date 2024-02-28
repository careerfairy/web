import React, { useCallback, useEffect, useState } from "react"
import { Formik } from "formik"

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
import { GENERAL_ERROR } from "components/util/constants"
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
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { PersonalInfo, personalInfoSchema } from "./schema"
import { UserData } from "@careerfairy/shared-lib/users"
import { FormProvider, useFormContext } from "react-hook-form"
import { BrandedTextFieldController } from "components/views/common/inputs/BrandedTextField"
import { BrandedCheckBoxController } from "components/views/common/inputs/BrandedCheckbox"
// import { LogoDev } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import UniversityCountrySelectorV2 from "components/views/universitySelect/UniversityCountrySelectorV2"

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

type Props = {
   userData: UserData
}

const PersonalInfo = ({ userData }: Props) => {
   const { userPresenter } = useAuth()
   const [open, setOpen] = useState(false)
   const { enqueueSnackbar } = useSnackbar()
   const router = useRouter()
   const dispatch = useDispatch()
   // @ts-ignore
   const { loading, error } = useSelector((state) => state.auth.profileEdit)

   const methods = useYupForm({
      schema: personalInfoSchema,
      defaultValues: {
         firstName: userData?.firstName || "",
         lastName: userData?.lastName || "",
         linkedinUrl: userData?.linkedinUrl || "",
         university: userData?.university,
         universityCountryCode: userData?.universityCountryCode || "",
         unsubscribed: userData?.unsubscribed || false,
         fieldOfStudy: userData?.fieldOfStudy,
         levelOfStudy: userData?.levelOfStudy,
         email: userData?.id,
      },
      mode: "onChange", // Important for the form to be validated on change, depending on your use case
   })

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
   }, [loading, error, enqueueSnackbar, dispatch])

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
      <FormProvider {...methods}>
         <Grid container spacing={2}>
            <Grid item xs={8}>
               <ContentCardTitle sx={styles.title}>
                  Personal Info
               </ContentCardTitle>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: "right" }}>
               <BadgeSimpleButton
                  badge={NetworkerBadge}
                  isActive={Boolean(userPresenter?.badges?.networkerBadge())}
                  onClick={navigateToReferrals}
               />
            </Grid>
         </Grid>
         <Grid container spacing={2}>
            <Grid item xs={12}>
               <BrandedTextFieldController
                  name="email"
                  disabled
                  fullWidth
                  id="email"
                  label="Email Address"
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <BrandedTextFieldController
                  name="firstName"
                  label="First Name"
                  fullWidth
                  requiredText="(required)"
                  disabled={methods.formState.isSubmitting}
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <BrandedTextFieldController
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  requiredText="(required)"
                  disabled={methods.formState.isSubmitting}
               />
            </Grid>
            <Grid item xs={12}>
               <Typography sx={styles.subtitle} variant="h5">
                  University
               </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
               {/* <UniversityCountrySelector
                  value={values.universityCountryCode}
                  handleClose={handleClose}
                  submitting={isSubmitting}
                  setFieldValue={setFieldValue}
                  error={
                     errors.universityCountryCode &&
                     touched.universityCountryCode &&
                     errors.universityCountryCode.toString()
                  }
                  handleOpen={handleOpen}
                  open={open}
               /> */}
               <UniversityCountrySelectorV2
                  name="universityCountryCode"
                  disabled={methods.formState.isSubmitting}
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               {/* <UniversitySelector
                  error={
                     errors.university &&
                     touched.university &&
                     errors.university
                  }
                  universityCountryCode={values.universityCountryCode}
                  values={values}
                  submitting={isSubmitting}
                  setFieldValue={setFieldValue}
               /> */}
            </Grid>
            <Grid item xs={12} sm={6}>
               {/* <FieldOfStudySelector
                  setFieldValue={setFieldValue}
                  value={values.fieldOfStudy}
                  disabled={isSubmitting}
                  error={
                     errors.fieldOfStudy &&
                     touched.fieldOfStudy &&
                     errors.fieldOfStudy
                  }
               /> */}
            </Grid>
            <Grid item xs={12} sm={6}>
               {/* <LevelOfStudySelector
                  setFieldValue={setFieldValue}
                  value={values.levelOfStudy}
                  disabled={isSubmitting}
                  error={
                     errors.levelOfStudy &&
                     touched.levelOfStudy &&
                     errors.levelOfStudy
                  }
               /> */}
            </Grid>
            <Grid item xs={12}>
               <Typography sx={styles.subtitle} variant="h5">
                  Social
               </Typography>
            </Grid>
            <Grid item xs={12}>
               <BrandedTextFieldController
                  id="linkedinUrl"
                  name="linkedinUrl"
                  label="LinkedIn (optional)"
                  placeholder="https://www.linkedin.com/in/username/"
                  disabled={methods.formState.isSubmitting}
                  autoComplete="lname"
                  fullWidth
               />
            </Grid>
            <Grid item xs={12}>
               <Typography sx={styles.subtitle} variant="h5">
                  Newsletter
               </Typography>
            </Grid>
            <Grid item xs={12}>
               <BrandedCheckBoxController
                  name="unsubscribed"
                  label={
                     <Typography>
                        I want to join <b>60’000+ students</b> who receive
                        personalised invitations to career events and job
                        openings 👍
                     </Typography>
                  }
               />
            </Grid>
         </Grid>

         <SubmitButton />
      </FormProvider>
   )

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
                              error={
                                 errors.university && touched.university
                                    ? errors.university
                                    : null
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
                              disabled={isSubmitting}
                              error={
                                 errors.levelOfStudy && touched.levelOfStudy
                                    ? errors.levelOfStudy
                                    : null
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
                           Boolean(isSubmitting) && (
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

const SubmitButton = () => {
   const { handleSubmit, formState } = useFormContext<PersonalInfo>()
   const dispatch = useDispatch()

   const onSubmit = (data: PersonalInfo) => {
      console.log("🚀 ~ file: PersonalInfo.tsx:583 ~ onSubmit ~ data:", data)
      dispatch(actions.editUserProfile(data))
   }

   return (
      <LoadingButton
         loading={formState.isSubmitting}
         onClick={() => handleSubmit(onSubmit)()}
         variant="contained"
         color="primary"
         fullWidth
         sx={styles.submit}
      >
         {formState.isSubmitting ? "Updating" : "Update"}
      </LoadingButton>
   )
}

export default PersonalInfo
