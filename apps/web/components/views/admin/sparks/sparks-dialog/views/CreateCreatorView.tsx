import { Box, Grid } from "@mui/material"
import { Field, Form, Formik } from "formik"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { G } from "@react-pdf/renderer"

const styles = sxStyles({
   root: {
      m: "auto",
      width: "100%",
   },
})

type CreateCreatorFormValues = Pick<
   Creator,
   | "firstName"
   | "lastName"
   | "position"
   | "email"
   | "avatarUrl"
   | "linkedInUrl"
   | "story"
>

const initialValues: CreateCreatorFormValues = {
   firstName: "",
   lastName: "",
   position: "",
   email: "",
   avatarUrl: "",
   linkedInUrl: "",
   story: "",
}

const CreateCreatorSchema = yup.object().shape({
   firstName: yup
      .string()
      .max(50, "First Name must be less than 50 characters")
      .required("First Name is required"),
   lastName: yup
      .string()
      .max(50, "Last Name must be less than 50 characters")
      .required("Last Name is required"),
   position: yup
      .string()
      .max(50, "Position must be less than 50 characters")
      .required("Position is required"),
   email: yup.string().email("Invalid email").required("Email is required"),
   avatarUrl: yup.string().required("Avatar URL is required"),
   linkedInUrl: yup.string().url().required("LinkedIn URL is required"),
   story: yup.string().max(500, "Story must be less than 500 characters"),
})

const CreateCreatorView = () => {
   const form = useSparksForm()

   return (
      <SparksDialog.Container sx={styles.root}>
         <SparksDialog.Title>
            Create a new{" "}
            <Box component="span" color="secondary.main">
               profile
            </Box>
         </SparksDialog.Title>
         <SparksDialog.Subtitle>
            Insert your new creator details!
         </SparksDialog.Subtitle>
         <Box mt={5} />
         <Formik
            initialValues={initialValues}
            validationSchema={CreateCreatorSchema}
            onSubmit={(values, { setSubmitting }) => {}}
         >
            {({ submitForm, isSubmitting, touched, errors }) => (
               <Form>
                  <Grid container spacing={2}>
                     <Grid item xs={12} sm={6}>
                        <Field
                           component={BrandedTextField}
                           name="firstName"
                           type="text"
                           label="First Name"
                           placeholder="John"
                           error={
                              touched.firstName
                                 ? Boolean(errors.firstName)
                                 : null
                           }
                           helperText={
                              touched.firstName ? errors.firstName : null
                           }
                           fullWidth
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <Field
                           component={BrandedTextField}
                           name="lastName"
                           type="text"
                           label="Last Name"
                           placeholder="Doe"
                           error={
                              touched.lastName ? Boolean(errors.lastName) : null
                           }
                           helperText={
                              touched.lastName ? errors.lastName : null
                           }
                           fullWidth
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <Field
                           component={BrandedTextField}
                           name="position"
                           type="text"
                           label="Position"
                           placeholder="Ex: Marketing Manager"
                           autoComplete="organization-title"
                           error={
                              touched.position ? Boolean(errors.position) : null
                           }
                           helperText={
                              touched.position ? errors.position : null
                           }
                           fullWidth
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <Field
                           component={BrandedTextField}
                           name="linkedInUrl"
                           type="text"
                           label="LinkedIn Link"
                           placeholder="Ex: linkedin.com/in/user"
                           autoComplete="url"
                           error={
                              touched.linkedInUrl
                                 ? Boolean(errors.linkedInUrl)
                                 : null
                           }
                           helperText={
                              touched.linkedInUrl ? errors.linkedInUrl : null
                           }
                           fullWidth
                        />
                     </Grid>
                     <Grid item xs={12}>
                        <Field
                           component={BrandedTextField}
                           name="email"
                           type="text"
                           label="Email address"
                           placeholder="ex: John@careerfairy.io"
                           error={touched.email ? Boolean(errors.email) : null}
                           helperText={touched.email ? errors.email : null}
                           fullWidth
                        />
                     </Grid>
                     <Grid item xs={12}>
                        <Field
                           component={BrandedTextField}
                           name="story"
                           type="text"
                           label="Personal story"
                           placeholder="Tell us about yourself!"
                           error={touched.story ? Boolean(errors.story) : null}
                           helperText={touched.story ? errors.story : null}
                           fullWidth
                           multiline
                           rows={4}
                        />
                     </Grid>
                  </Grid>
               </Form>
            )}
         </Formik>
         <SparksDialog.Actions>
            <SparksDialog.Button>Cancel</SparksDialog.Button>
         </SparksDialog.Actions>
      </SparksDialog.Container>
   )
}

export default CreateCreatorView
