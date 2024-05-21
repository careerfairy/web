import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Dialog, DialogContent, IconButton } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import {
   SlideLeftTransition,
   SlideUpTransition,
} from "components/views/common/transitions"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import MaximizeIcon from "./MaximizeIcon"
import PreviewContent from "./PreviewContent"
import {
   PREVIEW_COLUMN_PADDING_X,
   PREVIEW_COLUMN_PADDING_Y,
   REAL_DIALOG_WIDTH,
} from "./commons"

// CSS hack: above 100% to give some bottom margin
const PREVIEW_HEIGHT = "112.5%"

const styles = sxStyles({
   root: {
      height: PREVIEW_HEIGHT,
   },
   maximizeButton: {
      position: "absolute",
      margin: "6px",
      padding: 0,
      height: "38px",
      borderRadius: "40px",
      zIndex: 1,
   },
   maximizeIcon: {
      fontSize: 46,
   },
   preview: {
      maxWidth: `${REAL_DIALOG_WIDTH}px`,
      padding: `${PREVIEW_COLUMN_PADDING_Y}px ${PREVIEW_COLUMN_PADDING_X}px`,
      height: PREVIEW_HEIGHT,
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

type PreviewProps = {
   scale: number
}

const Preview = ({ scale }: PreviewProps) => {
   const isMobile = useIsMobile()
   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()

   return (
      <Box sx={styles.root}>
         <IconButton style={styles.maximizeButton} onClick={handleOpen}>
            <MaximizeIcon sx={styles.maximizeIcon} />
         </IconButton>
         <Box sx={styles.preview}>
            <PreviewContent isInDialog={false} scale={scale} />
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
               <PreviewContent
                  isInDialog={true}
                  handleCloseDialog={handleClose}
                  scale={scale}
               />
            </DialogContent>
         </Dialog>
      </Box>
   )
}

export default Preview
