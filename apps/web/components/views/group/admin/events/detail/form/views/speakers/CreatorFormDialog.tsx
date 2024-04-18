import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Grid } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import useCreatorFormSubmit, {
   CreatorFormValues,
} from "components/views/sparks/forms/hooks/useCreatorFormSubmit"
import AvatarUpload from "components/views/sparks/forms/inputs/AvatarUpload"
import CreateCreatorSchema from "components/views/sparks/forms/schemas/CreateCreatorSchema"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { EMAIL_TOOLTIP_INFO } from "constants/pages"
import { Form, Formik } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"

const styles = sxStyles({
   content: {
      mt: 1,
   },
   wrapContainer: {
      height: "100%",
      overflowY: "scroll",
      overflowX: "hidden",
   },
   container: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      px: 2,
   },
   form: {
      marginTop: "25px",
      marginBottom: "40px",
      paddingBottom: "48px",
   },
   title: {
      fontSize: { xs: "28px", md: "32px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   actions: {
      display: "flex",
      position: "absolute !important",
      backgroundColor: "#FFFFFF !important",
      height: "90px",
      marginBottom: {
         xs: "70px",
         md: "0",
      },
   },
   avatarGrid: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 1,
   },
})

type CreatorFormDialogProps = {
   creator: Creator
   handleClose: () => void
}

const CreatorFormDialog = ({
   creator,
   handleClose,
}: CreatorFormDialogProps) => {
   const isEdit = Boolean(creator)
   const { group } = useGroup()
   const isMobile = useIsMobile()

   const {
      values: { speakers },
      setFieldValue,
   } = useLivestreamFormValues()

   const onSuccessfulSubmit = (newCreator: Creator) => {
      setFieldValue("speakers.options", [
         ...speakers.options,
         { ...newCreator, isCreator: true },
      ])
      setFieldValue("speakers.values", [...speakers.values, newCreator])
      handleClose()
   }

   const { handleSubmit: handleCreatorSubmit } = useCreatorFormSubmit(
      group.id,
      onSuccessfulSubmit
   )

   return (
      <Formik
         initialValues={getInitialValues(creator)}
         validationSchema={CreateCreatorSchema}
         enableReinitialize
         onSubmit={handleCreatorSubmit}
      >
         {({ values, dirty, handleSubmit, isSubmitting, isValid }) => (
            <>
               <SteppedDialog.Container
                  containerSx={styles.content}
                  sx={styles.wrapContainer}
                  handleCloseIconClick={handleClose}
               >
                  <SteppedDialog.Content sx={styles.container}>
                     {creator ? (
                        <SteppedDialog.Title sx={styles.title}>
                           Edit your{" "}
                           <Box component="span" color="secondary.main">
                              contributor
                           </Box>
                        </SteppedDialog.Title>
                     ) : (
                        <SteppedDialog.Title sx={styles.title}>
                           Create {isMobile ? "" : "a"} new{" "}
                           <Box component="span" color="secondary.main">
                              contributor
                           </Box>
                        </SteppedDialog.Title>
                     )}
                     <SteppedDialog.Subtitle sx={styles.subtitle}>
                        {creator
                           ? "Check and change your contributor details"
                           : "Insert your new contributor details!"}
                     </SteppedDialog.Subtitle>
                     <Box sx={styles.form}>
                        <Form>
                           <Grid container spacing={2}>
                              <Grid sx={styles.avatarGrid} item xs={12}>
                                 <AvatarUpload
                                    name="avatarFile"
                                    groupId={group.id}
                                    remoteUrl={creator?.avatarUrl}
                                 />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                 <FormBrandedTextField
                                    name="firstName"
                                    type="text"
                                    label="First Name"
                                    placeholder="John"
                                    fullWidth
                                    requiredText={"(required)"}
                                 />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                 <FormBrandedTextField
                                    name="lastName"
                                    type="text"
                                    label="Last Name"
                                    placeholder="Doe"
                                    fullWidth
                                    requiredText={"(required)"}
                                 />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                 <FormBrandedTextField
                                    name="position"
                                    type="text"
                                    label="Position"
                                    placeholder="E.g.,: Marketing Manager"
                                    autoComplete="organization-title"
                                    fullWidth
                                    requiredText={"(required)"}
                                 />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                 <FormBrandedTextField
                                    name="linkedInUrl"
                                    type="text"
                                    label="LinkedIn Link"
                                    placeholder="E.g.,: linkedin.com/in/user"
                                    autoComplete="url"
                                    fullWidth
                                 />
                              </Grid>
                              <Grid item xs={12}>
                                 <FormBrandedTextField
                                    name="email"
                                    type="text"
                                    label="Email address"
                                    placeholder="E.g.,: John@careerfairy.io"
                                    disabled={Boolean(values.id)} // if we are editing a creator, we don't want to allow changing the email
                                    fullWidth
                                    requiredText={"(required)"}
                                    tooltipText={EMAIL_TOOLTIP_INFO}
                                 />
                              </Grid>
                              <Grid item xs={12}>
                                 <FormBrandedTextField
                                    name="story"
                                    type="text"
                                    label="Personal story"
                                    placeholder="Tell talent a little more about your story and professional background!"
                                    fullWidth
                                    multiline
                                    rows={4}
                                 />
                              </Grid>
                           </Grid>
                        </Form>
                     </Box>
                  </SteppedDialog.Content>
               </SteppedDialog.Container>
               <SteppedDialog.Actions sx={styles.actions}>
                  <SteppedDialog.Button
                     variant="outlined"
                     color="grey"
                     onClick={handleClose}
                  >
                     Cancel
                  </SteppedDialog.Button>

                  <SteppedDialog.Button
                     variant="contained"
                     color={"secondary"}
                     disabled={isSubmitting || !isValid || !dirty}
                     type="submit"
                     onClick={() => handleSubmit()}
                     loading={isSubmitting}
                  >
                     {isEdit ? "Save" : "Create"}
                  </SteppedDialog.Button>
               </SteppedDialog.Actions>
            </>
         )}
      </Formik>
   )
}

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

export default CreatorFormDialog
