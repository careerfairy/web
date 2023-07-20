import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Grid } from "@mui/material"
import CreatorFetchWrapper from "HOCs/creator/CreatorFetchWrapper"
import { BrandedTextFieldField } from "components/views/common/inputs/BrandedTextField"
import { Form, Formik } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback } from "react"
import { useSelector } from "react-redux"
import { sparksSelectedCreatorId } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import AvatarUpload from "./components/AvatarUpload"
import useCreatorFormSubmit, {
   CreatorFormValues,
} from "./hooks/useCreatorFormSubmit"
import CreateCreatorSchema from "./schemas/CreateCreatorSchema"

const styles = sxStyles({
   avaGrid: {
      display: "flex",
      justifyContent: "center",
   },
})

const getInitialValues = (creator?: Creator): CreatorFormValues => ({
   avatarUrl: creator?.avatarUrl || "",
   avatarFile: null,
   firstName: creator?.firstName || "",
   lastName: creator?.lastName || "",
   position: creator?.position || "",
   linkedInUrl: creator?.linkedInUrl || "",
   story: creator?.story || "",
   email: creator?.email || "",
   id: creator?.id || "",
})

const CreateOrEditCreatorView = () => {
   const { goToSelectCreatorView } = useSparksForm()
   const { group } = useGroup()

   const { handleSubmit } = useCreatorFormSubmit(group.id)

   const selectedCreatorId = useSelector(sparksSelectedCreatorId)

   const handleBack = useCallback(() => {
      goToSelectCreatorView()
   }, [goToSelectCreatorView])

   return (
      <CreatorFetchWrapper
         selectedCreatorId={selectedCreatorId}
         groupId={group.id}
         shouldFetch={Boolean(selectedCreatorId)}
      >
         {(creator) => (
            <SparksDialog.Container onMobileBack={() => handleBack()}>
               {creator ? (
                  <SparksDialog.Title pl={2}>
                     <Box component="span" color="secondary.main">
                        Editing
                     </Box>{" "}
                     creator
                  </SparksDialog.Title>
               ) : (
                  <SparksDialog.Title pl={2}>
                     Create a new{" "}
                     <Box component="span" color="secondary.main">
                        profile
                     </Box>
                  </SparksDialog.Title>
               )}
               <SparksDialog.Subtitle>
                  {creator
                     ? "Please check if that’s the correct creator"
                     : "Insert your new creator details!"}
               </SparksDialog.Subtitle>
               <Box mt={4} />
               <Formik
                  initialValues={getInitialValues(creator)}
                  validationSchema={CreateCreatorSchema}
                  enableReinitialize
                  onSubmit={handleSubmit}
               >
                  {({
                     submitForm,
                     isSubmitting,
                     dirty,
                     isValid,
                     resetForm,
                  }) => (
                     <Form>
                        <Grid container spacing={2}>
                           <Grid sx={styles.avaGrid} item xs={12}>
                              <AvatarUpload
                                 name="avatarFile"
                                 groupId={group.id}
                                 remoteUrl={creator?.avatarUrl}
                              />
                              <Box mt={2} />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <BrandedTextFieldField
                                 name="firstName"
                                 type="text"
                                 label="First Name"
                                 placeholder="John"
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <BrandedTextFieldField
                                 name="lastName"
                                 type="text"
                                 label="Last Name"
                                 placeholder="Doe"
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <BrandedTextFieldField
                                 name="position"
                                 type="text"
                                 label="Position"
                                 placeholder="Ex: Marketing Manager"
                                 autoComplete="organization-title"
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <BrandedTextFieldField
                                 name="linkedInUrl"
                                 type="text"
                                 label="LinkedIn Link"
                                 placeholder="Ex: linkedin.com/in/user"
                                 autoComplete="url"
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12}>
                              <BrandedTextFieldField
                                 name="email"
                                 type="text"
                                 label="Email address"
                                 placeholder="ex: John@careerfairy.io"
                                 disabled={Boolean(selectedCreatorId)} // if we are editing a creator, we don't want to allow changing the email
                                 fullWidth
                              />
                           </Grid>
                           <Grid item xs={12}>
                              <BrandedTextFieldField
                                 name="story"
                                 type="text"
                                 label="Personal story"
                                 placeholder="Tell us about yourself!"
                                 fullWidth
                                 multiline
                                 rows={4}
                              />
                           </Grid>
                        </Grid>
                        <SparksDialog.ActionsOffset />
                        <SparksDialog.Actions>
                           <SparksDialog.Button
                              color="grey"
                              variant="outlined"
                              onClick={() => {
                                 resetForm()
                                 handleBack()
                              }}
                           >
                              Back
                           </SparksDialog.Button>
                           <SparksDialog.Button
                              variant="contained"
                              onClick={submitForm}
                              disabled={isSubmitting || !dirty || !isValid}
                              loading={isSubmitting}
                           >
                              {creator ? "Save changes" : "Create"}
                           </SparksDialog.Button>
                        </SparksDialog.Actions>
                     </Form>
                  )}
               </Formik>
            </SparksDialog.Container>
         )}
      </CreatorFetchWrapper>
   )
}

export default CreateOrEditCreatorView
