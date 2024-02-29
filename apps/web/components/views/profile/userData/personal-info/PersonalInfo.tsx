import { NetworkerBadge } from "@careerfairy/shared-lib/dist/badges/NetworkBadges"
import { LoadingButton } from "@mui/lab"
import { Grid, Typography } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { userRepo } from "data/RepositoryInstances"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import ContentCardTitle from "../../../../../layouts/UserLayout/ContentCardTitle"
import { sxStyles } from "../../../../../types/commonTypes"
import BadgeSimpleButton from "../../BadgeSimpleButton"
import { StudyDomainSelector } from "./StudyDomainSelector"
import { UniversityCountrySelector } from "./UniversityCountrySelector"
import { UniversitySelector } from "./UniversitySelector"
import { PersonalInfoFormValues, personalInfoSchema } from "./schema"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { ControlledBrandedCheckBox } from "components/views/common/inputs/ControlledBrandedCheckbox"
import { UserData } from "@careerfairy/shared-lib/users"

const styles = sxStyles({
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
})

type Props = {
   userData: UserData
}

const PersonalInfo = ({ userData }: Props) => {
   const { userPresenter } = useAuth()
   const router = useRouter()

   const methods = useYupForm({
      schema: personalInfoSchema,
      defaultValues: {
         firstName: userData?.firstName || "",
         lastName: userData?.lastName || "",
         linkedinUrl: userData?.linkedinUrl || "",
         university: {
            id: userData?.university?.code || "",
            value: userData?.university?.name || "",
         },
         universityCountryCode: userData?.universityCountryCode || "",
         unsubscribed: userData?.unsubscribed || false,
         fieldOfStudy: {
            id: userData?.fieldOfStudy?.id || "",
            value: userData?.fieldOfStudy?.name || "",
         },
         levelOfStudy: {
            id: userData?.levelOfStudy?.id || "",
            value: userData?.levelOfStudy?.name || "",
         },
      },
      mode: "onChange", // Important for the form to be validated on change, depending on your use case
   })

   const navigateToReferrals = useCallback(() => {
      void router.push({
         pathname: "/profile/referrals",
      })

      return {} // match event handler signature
   }, [router])

   const isSubmitting = methods.formState.isSubmitting

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
               <BrandedTextField
                  name="email"
                  fullWidth
                  id="email"
                  label="Email Address"
                  value={userData.userEmail}
                  disabled
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <ControlledBrandedTextField
                  name="firstName"
                  label="First Name"
                  fullWidth
                  requiredText="(required)"
                  disabled={isSubmitting}
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <ControlledBrandedTextField
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  requiredText="(required)"
                  disabled={isSubmitting}
               />
            </Grid>
            <Grid item xs={12}>
               <Typography sx={styles.subtitle} variant="h5">
                  University
               </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
               <UniversityCountrySelector
                  name="universityCountryCode"
                  universityFieldName="university"
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <UniversitySelector
                  name="university"
                  countryCodesName="universityCountryCode"
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <StudyDomainSelector
                  collection="fieldsOfStudy"
                  name="fieldOfStudy"
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <StudyDomainSelector
                  collection="levelsOfStudy"
                  name="levelOfStudy"
               />
            </Grid>
            <Grid item xs={12}>
               <Typography sx={styles.subtitle} variant="h5">
                  Social
               </Typography>
            </Grid>
            <Grid item xs={12}>
               <ControlledBrandedTextField
                  id="linkedinUrl"
                  name="linkedinUrl"
                  label="LinkedIn (optional)"
                  placeholder="https://www.linkedin.com/in/username/"
                  disabled={isSubmitting}
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
               <ControlledBrandedCheckBox
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
}

const SubmitButton = () => {
   const { handleSubmit, formState, reset } =
      useFormContext<PersonalInfoFormValues>()
   const { userData } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const onSubmit = async (data: PersonalInfoFormValues) => {
      try {
         await userRepo.updateUserData(userData.id, {
            firstName: data.firstName,
            lastName: data.lastName,
            linkedinUrl: data.linkedinUrl,
            fieldOfStudy: {
               id: data.fieldOfStudy.id,
               name: data.fieldOfStudy.value,
            },
            levelOfStudy: {
               id: data.levelOfStudy.id,
               name: data.levelOfStudy.value,
            },
            university: {
               code: data.university.id,
               name: data.university.value,
            },
            universityCountryCode: data.universityCountryCode,
            unsubscribed: data.unsubscribed,
         })
         reset(data)
         successNotification("Your profile has been updated!")
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while updating your profile. Rest assured, we're on it!"
         )
      }
   }

   return (
      <LoadingButton
         loading={formState.isSubmitting}
         onClick={() => handleSubmit(onSubmit)()}
         variant="contained"
         color="primary"
         fullWidth
         disabled={!formState.isDirty}
         sx={styles.submit}
      >
         {formState.isSubmitting ? "Updating" : "Update"}
      </LoadingButton>
   )
}

export default PersonalInfo
