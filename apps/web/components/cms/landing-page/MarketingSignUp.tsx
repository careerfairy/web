import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"
import {
   Button,
   CircularProgress,
   FormHelperText,
   Grid,
   MenuItem,
   TextField,
   Typography,
} from "@mui/material"
import React, { useMemo, useState } from "react"
import { marketingServiceInstance } from "../../../data/firebase/MarketingService"
import { Formik } from "formik"
import * as yup from "yup"
import SessionStorageUtil from "util/SessionStorageUtil"
import { marketingSignUpFormId } from "../constants"
import {
   HygraphResponseButton,
   HygraphResponseMarketingSignup,
} from "../../../types/cmsTypes"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/marketing/MarketingUser"
import { useRouter } from "next/router"

const styles = sxStyles({
   container: {
      borderRadius: " 0px 224px 224px 0px",
      width: "95%",
      background: (theme) =>
         `linear-gradient(to right, ${theme.palette.secondary.main}, 80%, ${theme.palette.secondary.light})`,
   },
})
interface MarketingSignUpProps extends HygraphResponseMarketingSignup {
   fieldsOfStudy: FieldOfStudy[]
}
const MarketingSignUp = ({
   shortText,
   title,
   button,
   fieldsOfStudy,
}: MarketingSignUpProps) => {
   const [isComplete, setComplete] = useState(false)
   return (
      <Box id={marketingSignUpFormId} sx={styles.container}>
         <Container>
            <Grid container spacing={2} p={10}>
               <Grid item xs={6}>
                  {shortText && (
                     <Typography variant="h2" color="white">
                        {shortText}
                     </Typography>
                  )}
               </Grid>
               <Grid item xs={6}>
                  {title && (
                     <Typography variant="h6" color="white">
                        {title}
                     </Typography>
                  )}
                  <Box mt={3}>
                     {!isComplete && (
                        <MarketingForm
                           buttonProps={button}
                           setComplete={setComplete}
                           fieldsOfStudy={fieldsOfStudy}
                        />
                     )}
                     {isComplete && <Complete />}
                  </Box>
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const Complete = () => {
   return (
      <Box>
         <Typography variant={"h3"}>
            Expect to receive news from us soon!
         </Typography>
      </Box>
   )
}

const schema = yup.object().shape({
   email: yup.string().email().required(),
   firstName: yup.string().label("First Name").min(2).required(),
   lastName: yup.string().label("Last Name").min(2).required(),
   fieldOfStudyId: yup.string().label("Field of Study").required(),
})

interface Props {
   buttonProps: HygraphResponseButton
   setComplete: (complete: boolean) => void
   fieldsOfStudy: FieldOfStudy[]
}
const MarketingForm = ({ setComplete, buttonProps, fieldsOfStudy }: Props) => {
   const {
      query: { fieldOfStudyId },
   } = useRouter()
   const initialValues = useMemo(
      () => ({
         firstName: "",
         lastName: "",
         email: "",
         fieldOfStudyId: fieldOfStudyId?.toString() || "",
         subscribed: false,
      }),
      [fieldOfStudyId]
   )
   const [backendError, setBackendError] = useState<Error>(null)
   console.log("button props ->", { ...buttonProps })
   return (
      <Formik
         initialValues={initialValues}
         validationSchema={schema}
         enableReinitialize
         onSubmit={(values, { setSubmitting, resetForm }) => {
            marketingServiceInstance
               .create({
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  fieldOfStudyId: values.fieldOfStudyId,
                  utmParams: SessionStorageUtil.getUTMParams() ?? {},
               })
               .then((_) => {
                  console.log("Created with success")
                  resetForm()
                  setComplete(true)
                  setBackendError(null)
               })
               .catch((e) => {
                  console.log("failed", e)
                  setBackendError(e)
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
               <>
                  <Grid container spacing={2}>
                     <Grid item xs>
                        <TextField
                           className="marketingForm"
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
                           className="marketingForm"
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
                           className="marketingForm"
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
                  {!initialValues.fieldOfStudyId && (
                     <Box mt={2}>
                        <FieldOfStudySelector
                           value={values.fieldOfStudyId}
                           disabled={isSubmitting}
                           onChange={handleChange}
                           fieldsOfStudy={fieldsOfStudy}
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
                  )}
                  <Box mt={2} width={"30%"}>
                     <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting}
                        endIcon={
                           isSubmitting && (
                              <CircularProgress size={20} color="inherit" />
                           )
                        }
                        {...buttonProps}
                        href={undefined}
                        size={buttonProps?.size || "small"}
                     >
                        {buttonProps?.children || "Send"}
                     </Button>
                  </Box>
                  {backendError && <BackendError error={backendError} />}
               </>
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
   fieldsOfStudy,
}) => {
   return (
      <>
         <TextField
            select
            className="marketingForm"
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
            {fieldsOfStudy.map((entry) => (
               <MenuItem key={entry.name} value={entry.id}>
                  {entry.name}
               </MenuItem>
            ))}
         </TextField>
      </>
   )
}

const BackendError = ({ error }) => {
   return <FormHelperText error>{error.message}</FormHelperText>
}

export default MarketingSignUp
