import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Dialog, DialogContent, IconButton } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import {
   SlideLeftTransition,
   SlideUpTransition,
} from "components/views/common/transitions"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import { useEffect, useMemo, useRef, useState } from "react"
import MaximizeIcon from "./MaximizeIcon"
import PreviewContent from "./PreviewContent"
import {
   PREVIEW_COLUMN_PADDING_X,
   PREVIEW_COLUMN_PADDING_Y,
   REAL_DIALOG_WIDTH,
} from "./commons"

const getStyles = (responsiveHeight: string) =>
   sxStyles({
      root: {
         height: responsiveHeight,
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
         height: responsiveHeight,
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
   const previewRef = useRef(null)
   const [previewCalculatedHeight, setPreviewCalculatedHeight] = useState<
      number | null
   >(null)
   const isMobile = useIsMobile()
   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()

   const styles = useMemo(
      () =>
         getStyles(
            previewCalculatedHeight +
               PREVIEW_COLUMN_PADDING_Y * 2 +
               "px !important"
         ),
      [previewCalculatedHeight]
   )

   useEffect(() => {
      const updateFormHeight = () => {
         if (previewRef.current) {
            const previewCalculatedHeight =
               previewRef.current?.getBoundingClientRect().height
            setPreviewCalculatedHeight(previewCalculatedHeight)
         }
      }

      const timeoutId = setTimeout(() => {
         updateFormHeight()
         window.addEventListener("resize", updateFormHeight)
      }, 200)

      return () => {
         clearTimeout(timeoutId)
         window.removeEventListener("resize", updateFormHeight)
      }
   }, [])

   return (
      <Box sx={styles.root}>
         <IconButton style={styles.maximizeButton} onClick={handleOpen}>
            <MaximizeIcon sx={styles.maximizeIcon} />
         </IconButton>
         <Box sx={styles.preview}>
            <PreviewContent isInDialog={false} scale={scale} ref={previewRef} />
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
