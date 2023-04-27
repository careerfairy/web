import { Button, CircularProgress, Stack } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { Formik } from "formik"
import React, { useCallback, useMemo } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import * as yup from "yup"
import { URL_REGEX } from "components/util/constants"
import { errorLogAndNotify } from "../../../../util/CommonUtil"
import { userRepo } from "../../../../data/RepositoryInstances"
import { UserData } from "@careerfairy/shared-lib/users"
import PersonalInfo from "./PersonalInfo"
import SocialInfo from "./SocialInfo"

const styles = sxStyles({
   root: {
      display: "flex",
      p: 4,
      pr: { xs: 4, lg: 12 },
   },
})

const schema = yup.object().shape({
   firstName: yup
      .string()
      .required("The first name is required")
      .max(50, "Cannot be longer than 50 characters"),
   lastName: yup
      .string()
      .required("The last name is required")
      .max(50, "Cannot be longer than 50 characters"),
   linkedinUtl: yup.string().matches(URL_REGEX, "Please enter a valid URL"),
   fieldOfStudy: yup.object().nullable().shape({
      id: yup.string(),
      name: yup.string(),
   }),
   position: yup.string().max(50, "Cannot be longer than 50 characters"),
   avatar: yup.string(),
})

const Profile = () => {
   const { userData } = useAuth()

   const initialValues = useMemo<Partial<UserData>>(
      () => ({
         firstName: userData?.firstName || "",
         lastName: userData?.lastName || "",
         linkedinUrl: userData?.linkedinUrl || "",
         fieldOfStudy: userData?.fieldOfStudy || null,
         position: userData?.position || "",
         avatar: userData?.avatar || "",
         email: userData?.userEmail,
      }),
      [
         userData?.firstName,
         userData?.lastName,
         userData?.linkedinUrl,
         userData?.fieldOfStudy,
         userData?.position,
         userData?.avatar,
         userData?.userEmail,
      ]
   )

   const handleSubmitForm = useCallback(
      async (values) => {
         try {
            await userRepo.updateAdditionalInformation(
               userData.userEmail,
               values
            )
         } catch (e) {
            errorLogAndNotify(e)
         }
      },
      [userData.userEmail]
   )

   return (
      <Formik
         initialValues={initialValues}
         enableReinitialize
         validationSchema={schema}
         onSubmit={handleSubmitForm}
      >
         {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
            dirty,
         }) => (
            <form onSubmit={handleSubmit}>
               <Stack spacing={8} sx={styles.root}>
                  <PersonalInfo
                     handleChange={handleChange}
                     values={values}
                     handleBlur={handleBlur}
                     errors={errors}
                     touched={touched}
                     isSubmitting={isSubmitting}
                     setFieldValue={setFieldValue}
                     imagePathId={userData.authId}
                  />
                  <SocialInfo
                     isSubmitting={isSubmitting}
                     handleChange={handleChange}
                     handleBlur={handleBlur}
                     values={values}
                     errors={errors}
                     touched={touched}
                  />

                  <Button
                     type="submit"
                     fullWidth
                     variant="contained"
                     color="primary"
                     disabled={isSubmitting || !dirty}
                     startIcon={
                        isSubmitting ? (
                           <CircularProgress size={20} color="inherit" />
                        ) : null
                     }
                  >
                     {isSubmitting ? "Saving" : "Save changes"}
                  </Button>
               </Stack>
            </form>
         )}
      </Formik>
   )
}

export default Profile
