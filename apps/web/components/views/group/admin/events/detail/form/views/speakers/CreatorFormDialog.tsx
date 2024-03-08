import { FC } from "react"
import { Formik } from "formik"
import { Box } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"
import { useGroup } from "layouts/GroupDashboardLayout"
import useIsMobile from "components/custom-hook/useIsMobile"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import CreateOrEditCreatorForm from "components/views/sparks/forms/CreateOrEditCreatorForm"
import CreateCreatorSchema from "components/views/sparks/forms/schemas/CreateCreatorSchema"
import { CreatorFormValues } from "components/views/sparks/forms/hooks/useCreatorFormSubmit"

const styles = sxStyles({
   wrapContainer: {
      height: {
         md: "100%",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   content: {
      mt: 1,
   },
   form: {
      my: "40px",
   },
   title: {
      fontSize: { xs: "28px", md: "32px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   actions: {
      position: "absolute !important",
      backgroundColor: "#FFFFFF !important",
      width: "96% !important",
      marginLeft: "2%",
   },
})

type CreatorFormDialogProps = {
   creator: Creator
   handleClose: () => void
}

const CreatorFormDialog: FC<CreatorFormDialogProps> = ({
   creator,
   handleClose,
}) => {
   const isEdit = Boolean(creator)
   const { group } = useGroup()
   const isMobile = useIsMobile()

   const handleSubmit = undefined

   return (
      <Formik
         initialValues={getInitialValues(creator)}
         validationSchema={CreateCreatorSchema}
         enableReinitialize
         onSubmit={handleSubmit}
      >
         {({ dirty, handleSubmit, isSubmitting, isValid }) => (
            <SteppedDialog.Container
               containerSx={styles.content}
               sx={styles.wrapContainer}
               withActions
               handleCloseIconClick={handleClose}
            >
               <SteppedDialog.Content sx={styles.container}>
                  {creator ? (
                     <SteppedDialog.Title sx={styles.title}>
                        <Box component="span" color="secondary.main">
                           Editing
                        </Box>{" "}
                        creator
                     </SteppedDialog.Title>
                  ) : (
                     <SteppedDialog.Title sx={styles.title}>
                        Create {isMobile ? "" : "a"} new{" "}
                        <Box component="span" color="secondary.main">
                           profile
                        </Box>
                     </SteppedDialog.Title>
                  )}
                  <SteppedDialog.Subtitle sx={styles.subtitle}>
                     {creator
                        ? "Please check if that’s the correct creator"
                        : "Insert your new creator details!"}
                  </SteppedDialog.Subtitle>
                  <Box mt={4} />
                  <Box mt={"auto"} />
                  <Box sx={styles.form}>
                     <CreateOrEditCreatorForm
                        groupId={group.id}
                        creator={creator}
                        onSuccessfulSubmit={undefined}
                     />
                  </Box>
                  <Box mb={"auto"} />
               </SteppedDialog.Content>

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
            </SteppedDialog.Container>
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
