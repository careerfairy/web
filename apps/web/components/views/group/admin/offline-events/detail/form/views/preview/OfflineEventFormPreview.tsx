import { sxStyles } from "@careerfairy/shared-ui"
import { Box } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import OfflineEventFormDialog from "./OfflineEventFormDialog"
import OfflineEventFormPreviewDesktop from "./OfflineEventFormPreviewDesktop"
import OfflineEventFormPreviewMobile from "./OfflineEventFormPreviewMobile"

const styles = sxStyles({
   previewContainer: {
      position: "relative",
      marginTop: "10px !important",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
   },
})

const OfflineEventFormPreview = () => {
   const isMobile = useIsMobile()
   const [
      isPreviewDialogOpen,
      handlePreviewDialogOpen,
      handlePreviewDialogClose,
   ] = useDialogStateHandler()

   return (
      <>
         {isMobile ? (
            <OfflineEventFormPreviewMobile
               handleOnClick={handlePreviewDialogOpen}
            />
         ) : (
            <Box sx={styles.previewContainer}>
               <OfflineEventFormPreviewDesktop
                  handleDialogOpen={handlePreviewDialogOpen}
               />
            </Box>
         )}
         <OfflineEventFormDialog
            isOpen={isPreviewDialogOpen}
            handleClose={handlePreviewDialogClose}
         />
      </>
   )
}

export default OfflineEventFormPreview
