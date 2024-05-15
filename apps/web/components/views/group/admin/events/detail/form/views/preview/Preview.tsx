import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Dialog, DialogContent, IconButton } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import {
   SlideLeftTransition,
   SlideUpTransition,
} from "components/views/common/transitions"
import LivestreamDetailsViewSkeleton from "components/views/livestream-dialog/views/livestream-details/LivestreamDetailsViewSkeleton"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import MaximizeIcon from "./MaximizeIcon"

const styles = sxStyles({
   root: {
      position: "relative",
   },
   maximizeButton: {
      position: "absolute",
      margin: "6px",
      padding: 0,
      height: "38px",
      borderRadius: "40px",
   },
   maximizeIcon: {
      fontSize: 46,
   },
   preview: {
      padding: "24px 48px",
   },
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      borderRadius: {
         md: 5,
      },
      maxWidth: 915,
      height: "100%",
   },
})

const Preview = () => {
   const isMobile = useIsMobile()
   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()

   return (
      <Box sx={styles.root}>
         <IconButton style={styles.maximizeButton} onClick={handleOpen}>
            <MaximizeIcon sx={styles.maximizeIcon} />
         </IconButton>
         <Box sx={styles.preview}>
            <LivestreamDetailsViewSkeleton />
         </Box>
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
            <DialogContent>
               <LivestreamDetailsViewSkeleton />
            </DialogContent>
         </Dialog>
      </Box>
   )
}

export default Preview
