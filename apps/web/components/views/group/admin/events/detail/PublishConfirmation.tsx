import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useLivestreamDialog } from "layouts/GroupDashboardLayout/useLivestreamDialog"
import { useSnackbar } from "notistack"
import { useCallback } from "react"
import { CheckCircle } from "react-feather"
import { useLivestreamCreationContext } from "./LivestreamCreationContext"
import { mapFormValuesToLivestreamObject } from "./form/commons"
import { useLivestreamFormValues } from "./form/useLivestreamFormValues"

const styles = sxStyles({
   wrapContainer: {
      height: {
         xs: "320px",
         md: "100%",
      },
   },
   reducePadding: {
      px: { xs: 3, md: "28px !important" },
      height: {
         xs: "500px",
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
      my: 1,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
   },
   title: {
      fontSize: { xs: "18px", md: "20px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   actions: {
      position: "absolute !important",
      width: "100%",
      display: "flex",
      justifyContent: {
         xs: "center",
         md: "space-evenly",
      },
      borderTop: "none !important",
      backgroundColor: "#FFFFFF !important",
   },
   cancelBtn: {
      color: "grey",
   },
   actionBtn: {
      width: "160px",
      height: "40px",
      boxShadow: "none",
   },
})

export type RemoveQuestionProps = {
   handleCancelClick: () => void
}

export const PublishConfirmation = ({
   handleCancelClick,
}: RemoveQuestionProps) => {
   const { values, isValid } = useLivestreamFormValues()
   const { livestream } = useLivestreamCreationContext()
   const { group } = useGroup()
   const { isPublishing, handlePublishStream } = useLivestreamDialog(group)
   const { enqueueSnackbar } = useSnackbar()

   const handlePublishClick = useCallback(async () => {
      if (!isValid) {
         enqueueSnackbar("Form is invalid, please fix errors first.", {
            variant: "error",
         })
         return
      }

      try {
         const livestreamObject = mapFormValuesToLivestreamObject(values)
         livestreamObject.id = livestream.id
         await handlePublishStream(livestreamObject, {})
      } catch (error) {
         console.error("Auto-save failed:", error)
         enqueueSnackbar("Failed to auto-save live stream", {
            variant: "error",
         })
      } finally {
         handleCancelClick()
      }
   }, [
      enqueueSnackbar,
      handleCancelClick,
      handlePublishStream,
      isValid,
      livestream.id,
      values,
   ])

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
         hideCloseButton
         withActions
      >
         <SteppedDialog.Content sx={styles.container}>
            <Stack spacing={3} sx={styles.info}>
               <CheckCircle color={"#856DEE"} size={40} />

               <SteppedDialog.Title sx={styles.title}>
                  Ready to publish?
               </SteppedDialog.Title>

               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  Publishing your live stream will allow students to see the
                  details and register to attend.
               </SteppedDialog.Subtitle>
            </Stack>
         </SteppedDialog.Content>
         <SteppedDialog.Actions sx={styles.actions}>
            <SteppedDialog.Button
               variant="outlined"
               color="grey"
               onClick={handleCancelClick}
               sx={[styles.cancelBtn, styles.actionBtn]}
            >
               Keep editing
            </SteppedDialog.Button>

            <SteppedDialog.Button
               variant="contained"
               color={"secondary"}
               type="submit"
               onClick={handlePublishClick}
               sx={styles.actionBtn}
               disabled={!isValid}
               loading={isPublishing}
            >
               {"Publish"}
            </SteppedDialog.Button>
         </SteppedDialog.Actions>
      </SteppedDialog.Container>
   )
}
