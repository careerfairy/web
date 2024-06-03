import { sxStyles } from "@careerfairy/shared-ui"
import { Dialog, DialogContent } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import {
   SlideLeftTransition,
   SlideUpTransition,
} from "components/views/common/transitions"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import PreviewContent from "./PreviewContent"
import { REAL_DIALOG_WIDTH } from "./commons"

const styles = sxStyles({
   dialogContent: {
      padding: 1,
   },
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      borderRadius: {
         md: 5,
      },
      maxWidth: `${REAL_DIALOG_WIDTH}px`,
      height: "100%",
   },
})

type PreviewDialogProps = {
   isOpen: boolean
   handleClose: () => void
}

const PreviewDialog = ({ isOpen, handleClose }: PreviewDialogProps) => {
   const isMobile = useIsMobile()

   return (
      <Dialog
         open={isOpen}
         onClose={handleClose}
         TransitionComponent={
            isMobile ? SlideLeftTransition : SlideUpTransition
         }
         maxWidth="md"
         fullWidth
         fullScreen={isMobile}
         closeAfterTransition={true}
         PaperProps={{
            sx: styles.dialogPaper,
         }}
      >
         <DialogContent sx={styles.dialogContent}>
            <PreviewContent isInDialog={true} handleCloseDialog={handleClose} />
         </DialogContent>
      </Dialog>
   )
}

export default PreviewDialog
