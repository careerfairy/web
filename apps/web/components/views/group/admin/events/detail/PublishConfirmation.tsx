import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useSnackbar } from "notistack"
import { useCallback, useState } from "react"
import { CheckCircle } from "react-feather"
import { errorLogAndNotify } from "util/CommonUtil"
import { useLivestreamCreationContext } from "./LivestreamCreationContext"
import { useLivestreamFormValues } from "./form/useLivestreamFormValues"
import { usePublishLivestream } from "./form/usePublishLivestream"
import { ShareLivestreamDialog } from "./ShareLivestreamDialog"

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
      backgroundColor: (theme) => theme.brand.white[50] + " !important",
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
   const { isValid } = useLivestreamFormValues()
   const { group } = useGroup()
   const { livestream } = useLivestreamCreationContext()
   const { isPublishing, publishLivestream } = usePublishLivestream()
   const { enqueueSnackbar } = useSnackbar()
   const [showShareDialog, setShowShareDialog] = useState(false)
   const [publishedLivestreamId, setPublishedLivestreamId] = useState<string | null>(null)

   const handlePublishClick = useCallback(async () => {
      try {
         await publishLivestream()
         // On successful publish, show the share dialog instead of closing
         setPublishedLivestreamId(livestream.id)
         setShowShareDialog(true)
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Failed to publish stream",
            livestreamId: livestream.id,
            groupId: group.id,
         })
         enqueueSnackbar("Failed to publish stream", {
            variant: "error",
         })
         handleCancelClick()
      }
   }, [
      enqueueSnackbar,
      group.id,
      handleCancelClick,
      livestream.id,
      publishLivestream,
   ])

   const handleShareDialogClose = useCallback(() => {
      setShowShareDialog(false)
      setPublishedLivestreamId(null)
      handleCancelClick()
   }, [handleCancelClick])

   // Show share dialog after successful publishing
   if (showShareDialog && publishedLivestreamId) {
      return (
         <ShareLivestreamDialog
            handleClose={handleShareDialogClose}
            livestreamId={publishedLivestreamId}
         />
      )
   }

   // Show publish confirmation dialog by default
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
               disabled={isPublishing}
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
               {isPublishing ? "" : "Publish"}
            </SteppedDialog.Button>
         </SteppedDialog.Actions>
      </SteppedDialog.Container>
   )
}
