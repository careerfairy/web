import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"
import {
   Button,
   CircularProgress,
   Grid,
   MenuItem,
   TextField,
   Typography,
} from "@mui/material"
import React from "react"
import { marketingServiceInstance } from "../../../data/firebase/MarketingService"
import { Formik } from "formik"
import * as yup from "yup"
import { useFieldsOfStudy } from "../../custom-hook/useCollection"
import SessionStorageUtil from "util/SessionStorageUtil"
import { marketingSignUpFormId } from "../constants"

const styles = sxStyles({
   container: {
      backgroundColor: "grey.200",
   },
})

const MarketingSignUp = () => {
   return (
      <Box id={marketingSignUpFormId} sx={styles.container}>
         <Container>
            <Box p={3}>
               <Typography variant="h4">Stay connected</Typography>
               <Typography variant="subtitle1">
                  {"You'll"} receive emails for future livestream events
               </Typography>

               <Box mt={3}>
                  <MarketingForm />
               </Box>
            </Box>
         </Container>
      </Box>
   )
}

const initialValues = {
   firstName: "",
   lastName: "",
   email: "",
   fieldOfStudyId: "",
}

const schema = yup.object().shape({
   email: yup.string().email().required(),
   firstName: yup.string().label("First Name").min(2).required(),
   lastName: yup.string().label("Last Name").min(2).required(),
   fieldOfStudyId: yup.string().label("Field of Study").required(),
})

const MarketingForm = () => {
   return (
      <Formik
         initialValues={initialValues}
         validationSchema={schema}
         onSubmit={(values, { setSubmitting, resetForm }) => {
            marketingServiceInstance
               .create({
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  fieldOfStudy: JSON.parse(values.fieldOfStudyId),
                  utmParams: SessionStorageUtil.getUTMParams() ?? {},
               })
               .then((_) => {
                  console.log("Created with success")
                  resetForm()
               })
               .catch((e) => {
                  console.log("failed", e)
               })
               .finally(() => {
                  setSubmitting(false)
               })
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
         }) => (
            <form onSubmit={handleSubmit}>
               <Grid container spacing={2}>
                  <Grid item xs>
                     <TextField
                        autoComplete="fname"
                        label="First Name"
                        placeholder="Enter your first name"
                        variant="outlined"
                        id="firstName"
                        name="firstName"
                        fullWidth
                        disabled={isSubmitting}
                        value={values.firstName}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(
                           errors.firstName &&
                              touched.firstName &&
                              errors.firstName
                        )}
                        helperText={
                           errors.firstName &&
                           touched.firstName &&
                           errors.firstName
                        }
                     />
                  </Grid>
                  <Grid item xs>
                     <TextField
                        autoComplete="lname"
                        label="Last Name"
                        placeholder="Enter your last name"
                        variant="outlined"
                        id="lastName"
                        name="lastName"
                        fullWidth
                        disabled={isSubmitting}
                        value={values.lastName}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(
                           errors.lastName &&
                              touched.lastName &&
                              errors.lastName
                        )}
                        helperText={
                           errors.lastName &&
                           touched.lastName &&
                           errors.lastName
                        }
                     />
                  </Grid>
               </Grid>
               <Grid container mt={2}>
                  <Grid item xs>
                     <TextField
                        label="Email"
                        placeholder="Enter your email"
                        variant="outlined"
                        id="email"
                        name="email"
                        fullWidth
                        disabled={isSubmitting}
                        value={values.email}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(
                           errors.email && touched.email && errors.email
                        )}
                        helperText={
                           errors.email && touched.email && errors.email
                        }
                     />
                  </Grid>
               </Grid>
               <Box mt={2}>
                  <FieldOfStudySelector
                     value={values.fieldOfStudyId}
                     disabled={isSubmitting}
                     onChange={handleChange}
                     handleBlur={handleBlur}
                     error={Boolean(
                        errors.fieldOfStudyId &&
                           touched.fieldOfStudyId &&
                           errors.fieldOfStudyId
                     )}
                     helperText={
                        errors.fieldOfStudyId &&
                        touched.fieldOfStudyId &&
                        errors.fieldOfStudyId
                     }
                  />
               </Box>
               <Box mt={2} display={"flex"} justifyContent={"center"}>
                  <Button
                     type="submit"
                     fullWidth
                     size="large"
                     variant="contained"
                     color="primary"
                     disabled={isSubmitting}
                     endIcon={
                        isSubmitting && (
                           <CircularProgress size={20} color="inherit" />
                        )
                     }
                  >
                     Sign up
                  </Button>
               </Box>
            </form>
         )}
      </Formik>
   )
}

const FieldOfStudySelector = ({
   value,
   onChange,
   handleBlur,
   disabled,
   error,
   helperText,
}) => {
   const { data, isLoading } = useFieldsOfStudy()

   return (
      <>
         <TextField
            select
            id="fieldOfStudyId"
            name="fieldOfStudyId"
            label="Field of Study"
            disabled={disabled}
            value={value}
            onBlur={handleBlur}
            onChange={onChange}
            error={error}
            fullWidth
            variant="outlined"
            helperText={helperText}
         >
            {isLoading && (
               <MenuItem value="">
                  <em>Loading..</em>
               </MenuItem>
            )}
            {!isLoading &&
               data.map((entry) => (
                  <MenuItem key={entry.name} value={JSON.stringify(entry)}>
                     {entry.name}
                  </MenuItem>
               ))}
         </TextField>
      </>
   )
}

export default MarketingSignUp
