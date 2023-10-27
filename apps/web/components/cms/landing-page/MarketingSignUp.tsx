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
import React, { useCallback, useMemo, useState } from "react"
import { marketingServiceInstance } from "../../../data/firebase/MarketingService"
import { Formik } from "formik"
import * as yup from "yup"
import { marketingSignUpFormId } from "../constants"
import {
   HygraphResponseButton,
   HygraphResponseMarketingSignup,
} from "../../../types/cmsTypes"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/marketing/MarketingUser"
import { useRouter } from "next/router"
import useIsMobile from "../../custom-hook/useIsMobile"
import CmsImage from "../image"
import { useMarketingLandingPage } from "./MarketingLandingPageProvider"
import CookiesUtil from "../../../util/CookiesUtil"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"

const styles = sxStyles({
   largeContainer: {
      borderRadius: " 0px 224px 224px 0px",
      width: "95%",
      background: (theme) =>
         `linear-gradient(to right, ${theme.palette.secondary.main}, 80%, ${theme.palette.secondary.light})`,
   },
   smallContainer: {
      background: (theme) =>
         `linear-gradient(to right, ${theme.palette.secondary.main}, 80%, ${theme.palette.secondary.light})`,
   },
   leftBlock: {
      maxWidth: {
         xs: "100%",
         lg: "70%",
      },
      textAlign: "center",
   },
})

interface MarketingSignUpProps extends HygraphResponseMarketingSignup {
   fieldsOfStudy: FieldOfStudy[]
}

const MarketingSignUp = ({
   shortText,
   title,
   formTitle,
   button,
   fieldsOfStudy,
   icon,
}: MarketingSignUpProps) => {
   const isMobile = useIsMobile()
   const [isComplete, setComplete] = useState(false)
   return (
      <Box my={6}>
         <Box mb={8} mx={2} textAlign="center">
            <Typography variant="h2" fontWeight={500}>
               {formTitle}
            </Typography>
         </Box>
         <Box
            id={marketingSignUpFormId}
            sx={isMobile ? styles.smallContainer : styles.largeContainer}
         >
            <Grid container spacing={2} p={{ xs: 6, md: 8, lg: 10 }}>
               <Grid item xs={12} lg={6}>
                  {shortText && (
                     <Box sx={styles.leftBlock}>
                        {icon && (
                           <Box pb={4} maxWidth={70} margin="auto">
                              <CmsImage cmsImage={icon} />
                           </Box>
                        )}
                        <Typography variant="h4" color="white">
                           {shortText}
                        </Typography>
                     </Box>
                  )}
               </Grid>
               <Grid item xs={12} lg={6} mt={{ xs: 4, lg: 0 }}>
                  <Box maxWidth={{ lg: "100%", xl: "80%" }}>
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
                  </Box>
               </Grid>
            </Grid>
         </Box>
      </Box>
   )
}

const Complete = () => {
   return (
      <Box>
         <Typography variant={"h3"} color={"white"}>
            Expect to receive news from us soon!
         </Typography>
      </Box>
   )
}

const schema = yup.object().shape({
   email: yup.string().trim().email().required(),
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
      push,
   } = useRouter()
   const { selectedEventId, setFormCompleted } = useMarketingLandingPage()

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

   const handleSubmitForm = useCallback(
      (values, { setSubmitting, resetForm }) => {
         marketingServiceInstance
            .create({
               firstName: values.firstName,
               lastName: values.lastName,
               email: values.email.trim(),
               fieldOfStudyId: values.fieldOfStudyId,
               utmParams: CookiesUtil.getUTMParams() ?? {},
            })
            .then((_) => {
               setFormCompleted(true)
               resetForm()
               setComplete(true)
               setBackendError(null)

               if (selectedEventId) {
                  void push({
                     pathname: makeLivestreamEventDetailsUrl(selectedEventId, {
                        relative: true,
                     }),
                  })
               }
            })
            .catch((e) => {
               setBackendError(e)
            })
            .finally(() => {
               setSubmitting(false)
            })
      },
      [push, selectedEventId, setComplete, setFormCompleted]
   )

   return (
      <Formik
         initialValues={initialValues}
         validationSchema={schema}
         enableReinitialize
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
         }) => (
            <form onSubmit={handleSubmit}>
               <>
                  <Grid container spacing={2}>
                     <Grid item xs={12} md={6}>
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
                           // @ts-ignore
                           helperText={
                              errors.firstName &&
                              touched.firstName &&
                              errors.firstName
                           }
                        />
                     </Grid>
                     <Grid item xs={12} md={6}>
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
                           // @ts-ignore
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
                           // @ts-ignore
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
                           // @ts-ignore
                           helperText={
                              errors.fieldOfStudyId &&
                              touched.fieldOfStudyId &&
                              errors.fieldOfStudyId
                           }
                        />
                     </Box>
                  )}
                  <Box
                     mt={2}
                     width={{ xs: "100%", md: "fit-content" }}
                     minWidth={"30%"}
                  >
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
   fieldsOfStudy = [],
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
   return (
      <Box mt={1}>
         <FormHelperText error>{error.message}</FormHelperText>
      </Box>
   )
}

export default MarketingSignUp
