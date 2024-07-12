import { NO_EMAIL_ASSOCIATED_WITH_INVITE_ERROR_MESSAGE } from "@careerfairy/shared-lib/groups/GroupDashboardInvite"
import { UserData } from "@careerfairy/shared-lib/users"
import {
   Box,
   Button,
   CircularProgress,
   FormHelperText,
   Grid,
   Typography,
} from "@mui/material"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { Formik } from "formik"
import { FormikHelpers } from "formik/dist/types"
import { useRouter } from "next/router"
import { Fragment } from "react"
import * as yup from "yup"
import { sxStyles } from "../../../../types/commonTypes"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import InvalidInviteDisplay from "../../common/auth/InvalidInviteDisplay"
import HelperHint from "../common/HelperHint"
import { signupSchema } from "../schemas"
import Email from "../userInformation/Email"
import FirstName from "../userInformation/FirstName"
import LastName from "../userInformation/LastName"
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
})

export interface IAdminUserCreateFormValues
   extends Pick<UserData, "firstName" | "lastName"> {
   email: string
   password: string
   confirmPassword: string
   agreeTerm: boolean
}

const schema: yup.SchemaOf<IAdminUserCreateFormValues> = yup.object().shape({
   email: signupSchema.email,
   firstName: signupSchema.firstName,
   lastName: signupSchema.lastName,
   password: signupSchema.password,
   confirmPassword: signupSchema.confirmPassword,
   agreeTerm: signupSchema.agreeTerm,
})

const initValues: IAdminUserCreateFormValues = {
   firstName: "",
   lastName: "",
   email: "",
   password: "",
   confirmPassword: "",
   agreeTerm: false,
}

function SignUpAdminForm() {
   const firebase = useFirebaseService()
   const { replace } = useRouter()
   const { successNotification } = useSnackbarNotifications()

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
         const { data: group } =
            await firebase.createGroupAdminUserInAuthAndFirebase({
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

         await firebase.auth.currentUser.reload()

         // Send them directly to the group admin dashboard
         return replace(`/group/${group.id}/admin`).then(() => {
            successNotification(
               `Account created successfully and welcome to ${group.universityName}!`
            )
         })
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
                        <FirstName
                           value={values.firstName}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.firstName}
                           disabled={isSubmitting}
                           touched={touched.firstName}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <LastName
                           value={values.lastName}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.lastName}
                           disabled={isSubmitting}
                           touched={touched.lastName}
                        />
                     </Grid>
                     <Grid item xs={12}>
                        <Email
                           value={values.email}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.email}
                           disabled={isSubmitting}
                           touched={touched.email}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <Password
                           value={values.password}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.password}
                           disabled={isSubmitting}
                           touched={touched.password}
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <PasswordRepeat
                           value={values.confirmPassword}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           error={errors.confirmPassword}
                           disabled={isSubmitting}
                           touched={touched.confirmPassword}
                        />
                     </Grid>
                     <Grid item xs={12}>
                        <TermsAgreement
                           onChange={handleChange}
                           value={values.agreeTerm}
                           disabled={isSubmitting}
                           touched={touched.agreeTerm}
                           error={errors.agreeTerm}
                           onBlur={handleBlur}
                        />
                     </Grid>
                  </Grid>
                  {/*@ts-ignore*/}
                  <FormHelperText error hidden={!errors.general}>
                     {/*@ts-ignore*/}
                     <Box mt={3}>{renderError(errors.general)}</Box>
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
                        Boolean(isSubmitting) && (
                           <CircularProgress size={20} color="inherit" />
                        )
                     }
                     sx={styles.submit}
                  >
                     Sign up as an admin
                  </Button>
                  <HelperHint groupAdmin />
               </form>
            )}
         </Formik>
      </Fragment>
   )
}

const renderError = (message: string = "") => {
   const messageWithoutError = message?.replace("Error: ", "")
   switch (messageWithoutError) {
      case NO_EMAIL_ASSOCIATED_WITH_INVITE_ERROR_MESSAGE:
         return <InvalidInviteDisplay type={"signup"} />
      default:
         return messageWithoutError
   }
}
export default SignUpAdminForm
