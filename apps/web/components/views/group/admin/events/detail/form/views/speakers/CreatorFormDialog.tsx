import { FC } from "react"
import { Formik } from "formik"
import { Box } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"
import { useGroup } from "layouts/GroupDashboardLayout"
import { LivestreamCreator } from "../questions/commons"
import useIsMobile from "components/custom-hook/useIsMobile"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import CreateOrEditCreatorForm from "components/views/sparks/forms/CreateOrEditCreatorForm"
import CreateCreatorSchema from "components/views/sparks/forms/schemas/CreateCreatorSchema"
import { CreatorFormValues } from "components/views/sparks/forms/hooks/useCreatorFormSubmit"

const styles = sxStyles({
   content: {
      mt: 1,
   },
   wrapContainer: {
      height: "100%",
      overflowY: "scroll",
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
      marginTop: "40px",
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
})

type CreatorFormDialogProps = {
   creator: LivestreamCreator
   handleClose: () => void
}

const CreatorFormDialog: FC<CreatorFormDialogProps> = ({
   creator,
   handleClose,
}) => {
   const isEdit = Boolean(creator)
   const { group } = useGroup()
   const isMobile = useIsMobile()

   return (
      <Formik
         initialValues={getInitialValues(creator)}
         validationSchema={CreateCreatorSchema}
         enableReinitialize
         onSubmit={undefined}
      >
         {({ dirty, handleSubmit, isSubmitting, isValid }) => (
            <>
               <SteppedDialog.Container
                  containerSx={styles.content}
                  sx={styles.wrapContainer}
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
                     <Box sx={styles.form}>
                        <CreateOrEditCreatorForm
                           groupId={group.id}
                           creator={creator}
                           onSuccessfulSubmit={undefined}
                        />
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

const getInitialValues = (creator?: LivestreamCreator): CreatorFormValues => ({
   avatarUrl: creator?.avatarUrl || "",
   avatarFile: null,
   firstName: creator?.firstName || "",
   lastName: creator?.lastName || "",
   position: creator?.position || "",
   linkedInUrl: creator?.linkedInUrl || "",
   story: creator?.story || "",
   email: creator?.email || "",
   id: creator?.originalId || "",
})

export default CreatorFormDialog
