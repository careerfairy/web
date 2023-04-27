import {
   Box,
   Button,
   CircularProgress,
   Collapse,
   FormControl,
   FormHelperText,
   Grid,
   Stack,
   TextField,
   Tooltip,
   Typography,
} from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { Formik } from "formik"
import React, { useCallback, useMemo } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import * as yup from "yup"
import { URL_REGEX } from "components/util/constants"
import { getDownloadUrl } from "../../../helperFunctions/streamFormFunctions"
import ImageSelect from "../../draftStreamForm/ImageSelect/ImageSelect"
import { FieldOfStudySelector } from "../../signup/userInformation/FieldOfStudySelector"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import { errorLogAndNotify } from "../../../../util/CommonUtil"
import { userRepo } from "../../../../data/RepositoryInstances"
import { UserData } from "@careerfairy/shared-lib/users"

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
      }),
      [
         userData?.firstName,
         userData?.lastName,
         userData.linkedinUrl,
         userData?.fieldOfStudy,
         userData?.position,
         userData?.avatar,
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
                  <Box>
                     <Typography variant={"h5"} fontWeight={600}>
                        {" "}
                        Personal Information
                     </Typography>

                     <Grid container mt={4} alignItems={"end"}>
                        <Grid item xs={12} md={3}>
                           <ImageSelect
                              path={userData.authId}
                              getDownloadUrl={getDownloadUrl}
                              formName={`avatar`}
                              label="Avatar"
                              error={Boolean(errors.avatar)}
                              isSubmitting={isSubmitting}
                              value={values.avatar}
                              isAvatar
                              setFieldValue={setFieldValue}
                              showIconButton={false}
                              isButtonOutlined={true}
                              buttonCentered={true}
                           />
                        </Grid>
                        <Grid item xs={12} md={9} mt={{ xs: 4, md: 0 }}>
                           <Grid container spacing={4}>
                              <Grid item xs={12} sm={6}>
                                 <FormControl fullWidth>
                                    <TextField
                                       autoComplete="fname"
                                       name="firstName"
                                       variant="outlined"
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
                                          {errors.firstName}
                                       </FormHelperText>
                                    </Collapse>
                                 </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                 <FormControl fullWidth>
                                    <TextField
                                       variant="outlined"
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
                                          {errors.lastName}
                                       </FormHelperText>
                                    </Collapse>
                                 </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                 <FormControl fullWidth>
                                    <TextField
                                       variant="outlined"
                                       fullWidth
                                       id="position"
                                       label="Position"
                                       name="position"
                                       disabled={isSubmitting}
                                       onBlur={handleBlur}
                                       value={values.position}
                                       error={Boolean(
                                          errors.position &&
                                             touched.position &&
                                             errors.position
                                       )}
                                       onChange={handleChange}
                                    />
                                    <Collapse
                                       in={Boolean(
                                          errors.position &&
                                             touched.position &&
                                             errors.position
                                       )}
                                    >
                                       <FormHelperText error>
                                          {errors.position}
                                       </FormHelperText>
                                    </Collapse>
                                 </FormControl>
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
                           </Grid>
                        </Grid>
                     </Grid>
                  </Box>
                  <Box>
                     <Typography variant={"h5"} fontWeight={600}>
                        Social
                     </Typography>
                     <Box mt={4}>
                        <FormControl fullWidth>
                           <TextField
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                 endAdornment: (
                                    <Tooltip
                                       color={"secondary"}
                                       title={
                                          "We always request your consent before publishing it"
                                       }
                                    >
                                       <InfoIcon />
                                    </Tooltip>
                                 ),
                              }}
                              variant="outlined"
                              fullWidth
                              id="linkedinUrl"
                              label="LinkedIn"
                              name="linkedinUrl"
                              placeholder="Include your LinkedIn account to attract more young talent."
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
                                 {errors.linkedinUrl}
                              </FormHelperText>
                           </Collapse>
                        </FormControl>
                     </Box>
                  </Box>

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
