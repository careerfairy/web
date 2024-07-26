import { Creator, PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { CreateCreatorSchemaType } from "@careerfairy/shared-lib/groups/schemas"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box } from "@mui/material"
import useGroupCreator from "components/custom-hook/creator/useGroupCreator"
import useIsMobile from "components/custom-hook/useIsMobile"
import {
   CreatorFormFields,
   CreatorFormProvider,
} from "components/views/creator/CreatorForm"
import useCreatorFormSubmit from "components/views/sparks/forms/hooks/useCreatorFormSubmit"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { useFormContext } from "react-hook-form"

const styles = sxStyles({
   container: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
   },
   content: {
      width: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      px: 2,
      overflowX: "hidden",
      overflowY: "scroll",
      paddingTop: {
         xs: 13,
         md: 0,
      },
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
      backgroundColor: "#FFFFFF !important",
      height: "90px",
      position: {
         xs: "fixed !important",
         md: "absolute !important",
      },
   },
   avatarGrid: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 1,
   },
})

type MentorFormProps = {
   mentor: PublicCreator
   handleClose: () => void
}

export const MentorForm = ({ mentor, handleClose }: MentorFormProps) => {
   const isMobile = useIsMobile()
   const { data: creator } = useGroupCreator(
      mentor?.groupId || "",
      mentor?.id || "",
      {
         suspense: true,
         initialData: mentor,
      }
   )

   return (
      <CreatorFormProvider creator={creator}>
         <SteppedDialog.Container
            sx={styles.content}
            handleCloseIconClick={handleClose}
         >
            <SteppedDialog.Content sx={styles.container}>
               {creator?.id ? (
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
               <Box sx={styles.form} component="form">
                  <CreatorFormFields />
               </Box>
            </SteppedDialog.Content>
            <SteppedDialog.Actions sx={styles.actions}>
               <Actions creator={creator} handleClose={handleClose} />
            </SteppedDialog.Actions>
         </SteppedDialog.Container>
      </CreatorFormProvider>
   )
}

type ActionsProps = {
   creator: Creator
   handleClose: () => void
}

const Actions = ({ creator, handleClose }: ActionsProps) => {
   const { handleSubmit: handleCreatorSubmit } = useCreatorFormSubmit(
      creator?.groupId
   )

   const {
      handleSubmit,
      formState: { isSubmitting, isValid, isDirty },
   } = useFormContext<CreateCreatorSchemaType>()

   const onSubmit = async (values: CreateCreatorSchemaType) => {
      await handleCreatorSubmit(values, undefined)
   }

   return (
      <>
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
            disabled={isSubmitting || !isValid || !isDirty}
            type="submit"
            onClick={handleSubmit?.(onSubmit)}
            loading={isSubmitting}
         >
            {creator?.id ? "Save" : "Create"}
         </SteppedDialog.Button>
      </>
   )
}
