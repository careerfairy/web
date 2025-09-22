import { sxStyles } from "@careerfairy/shared-ui"
import { Dialog, DialogContent } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SlideUpTransition } from "components/views/common/transitions"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import OfflineEventFormPreviewContent from "./OfflineEventFormPreviewContent"

// const REAL_DIALOG_WIDTH = 915

const styles = sxStyles({
   dialogContent: {
      padding: 0, // TODO: Remove this
   },
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      borderRadius: {
         md: 5,
      },
      // maxWidth: `${REAL_DIALOG_WIDTH}px`,
      maxHeight: "700px",
      // height: "100%",
   },
   dialogPaperMobile: {
      ...NICE_SCROLLBAR_STYLES,
      position: "absolute",
      bottom: 0,
      borderRadius: 0, // No border radius for full screen mobile
      maxHeight: "85vh",
      height: "850vh",
      borderTopLeftRadius: "18px",
      borderTopRightRadius: "18px",
   },
})

type OfflineEventFormDialogProps = {
   isOpen: boolean
   handleClose: () => void
}

const OfflineEventFormDialog = ({
   isOpen,
   handleClose,
}: OfflineEventFormDialogProps) => {
   const isMobile = useIsMobile()

   return (
      <Dialog
         open={isOpen}
         onClose={handleClose}
         TransitionComponent={SlideUpTransition}
         maxWidth="md"
         fullWidth
         fullScreen={isMobile}
         closeAfterTransition={true}
         PaperProps={{
            sx: isMobile ? styles.dialogPaperMobile : styles.dialogPaper,
         }}
      >
         <DialogContent sx={styles.dialogContent}>
            <OfflineEventFormPreviewContent
               isInDialog={true}
               handleCloseDialog={handleClose}
            />
         </DialogContent>
      </Dialog>
   )
}

export default OfflineEventFormDialog
