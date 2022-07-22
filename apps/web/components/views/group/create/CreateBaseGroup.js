import React, { useState } from "react"
import PublishIcon from "@mui/icons-material/Publish"
import { Form as UiForm, Formik } from "formik"
import FilePickerContainer from "../../../../components/ssr/FilePickerContainer"
import {
   Box,
   Button,
   Container,
   FormControl,
   FormHelperText,
   TextField,
   Typography,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { useAuth } from "../../../../HOCs/AuthProvider"

const placeholder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-logos%2Fplaceholder.png?alt=media&token=242adbfc-8ebb-4221-94ad-064224dca266"

const useStyles = makeStyles((theme) => ({
   root: {
      paddingTop: "50px",
      paddingBottom: "50px",
   },
   title: {
      fontWeight: "300",
      color: "rgb(0, 210, 170)",
      fontSize: "calc(1.2em + 1.5vw)",
   },
   image: {
      margin: "20px auto 20px auto",
      maxWidth: "100%",
      maxHeight: "250px",
   },
   form: {
      display: "flex",
      flexFlow: "column",
      alignItems: "center",
      width: "100%",
   },
}))

const CreateBaseGroup = ({ handleNext, setBaseGroupInfo, baseGroupInfo }) => {
   const classes = useStyles()
   const [filePickerError, setFilePickerError] = useState("")
   const { authenticatedUser: user } = useAuth()

   return (
      <Container className={classes.root}>
         <Typography align="center" className={classes.title} variant="h1">
            Create a Career Group
         </Typography>
         <Formik
            initialValues={{
               logoUrl: baseGroupInfo.logoUrl || "",
               logoFileObj: baseGroupInfo.logoFileObj || null,
               universityName: baseGroupInfo.universityName || "",
               description: baseGroupInfo.description || "",
            }}
            validate={(values) => {
               let errors = {}
               if (!values.logoFileObj) {
                  errors.logoUrl = "Required"
               }
               if (!values.universityName) {
                  errors.universityName = "Required"
               } else if (values.universityName.length > 30) {
                  errors.universityName = "Must be 30 characters or less"
               }
               if (!values.description) {
                  errors.description = "Required"
               } else if (values.description.length > 60) {
                  errors.description = "Must be 60 characters or less"
               }
               return errors
            }}
            onSubmit={(values, { setSubmitting }) => {
               let careerCenter = {
                  adminEmails: [user.email],
                  logoUrl: values.logoUrl,
                  logoFileObj: values.logoFileObj || baseGroupInfo.logoFileObj,
                  description: values.description,
                  test: false,
                  universityName: values.universityName,
               }
               setBaseGroupInfo(careerCenter)
               setSubmitting(false)
               handleNext()
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
               setFieldValue,
               /* and other goodies */
            }) => (
               <UiForm className={classes.form} onSubmit={handleSubmit}>
                  <FormControl
                     className={classes.form}
                     error={Boolean(
                        (touched.logoUrl && errors.logoUrl) || filePickerError
                     )}
                  >
                     <Box>
                        <img
                           className={classes.image}
                           alt="logo"
                           src={
                              values.logoUrl.length
                                 ? values.logoUrl
                                 : placeholder
                           }
                        />
                     </Box>
                     <FilePickerContainer
                        extensions={["jpg", "jpeg", "png"]}
                        maxSize={20}
                        onBlur={handleBlur}
                        onChange={(fileObject) => {
                           setFilePickerError(null)
                           setFieldValue(
                              "logoUrl",
                              URL.createObjectURL(fileObject),
                              true
                           )
                           setFieldValue("logoFileObj", fileObject, true)
                        }}
                        onError={(errMsg) => setFilePickerError(errMsg)}
                     >
                        <Button
                           variant="contained"
                           size="large"
                           endIcon={<PublishIcon />}
                        >
                           {values.logoFileObj || baseGroupInfo.logoFileObj
                              ? "Change"
                              : "Upload Your Logo"}
                        </Button>
                     </FilePickerContainer>
                     <FormHelperText>
                        {touched.logoUrl && errors.logoUrl && "Logo required"}
                     </FormHelperText>
                     <FormHelperText>{filePickerError}</FormHelperText>
                  </FormControl>
                  <FormControl sx={{ mt: 2 }} className={classes.form}>
                     <TextField
                        id="groupName"
                        value={values.universityName}
                        onChange={handleChange}
                        inputProps={{ maxLength: 30 }}
                        error={Boolean(
                           touched.universityName && errors.universityName
                        )}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                        style={{ maxWidth: 500 }}
                        helperText={
                           touched.universityName && errors.universityName
                        }
                        label="Group Name"
                        name="universityName"
                        fullWidth
                     />
                  </FormControl>
                  <FormControl className={classes.form}>
                     <TextField
                        label="Description"
                        onChange={handleChange}
                        error={Boolean(
                           touched.description && errors.description
                        )}
                        value={values.description}
                        inputProps={{ maxLength: 60 }}
                        style={{
                           maxWidth: 500,
                           marginBottom: 30,
                           marginTop: 20,
                        }}
                        placeholder="Please describe the purpose of your group"
                        onBlur={handleBlur}
                        helperText={touched.description && errors.description}
                        disabled={isSubmitting}
                        name="description"
                        fullWidth
                     />
                  </FormControl>
                  <Button
                     size="large"
                     variant="contained"
                     style={{ maxWidth: 500 }}
                     fullWidth
                     disabled={isSubmitting}
                     color="primary"
                     type="submit"
                  >
                     Continue
                  </Button>
               </UiForm>
            )}
         </Formik>
      </Container>
   )
}

export default CreateBaseGroup
