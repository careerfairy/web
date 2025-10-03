import { sxStyles } from "@careerfairy/shared-ui"
import CloseIcon from "@mui/icons-material/CloseRounded"
import { Box, IconButton, Stack } from "@mui/material"
import { forwardRef, useMemo } from "react"
import {
   OfflineEventPreviewContent,
   OfflineEventPreviewContentProps,
} from "./OfflineEventPreviewContent"

const styles = sxStyles({
   root: {
      backgroundColor: (theme) => theme.brand.black[500],
      borderRadius: 3,
      padding: 0,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
   },
   closeButtonContainer: {
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 1,
   },
   closeIcon: {
      fontSize: "24px",
      color: "white",
   },
})

type OfflineEventFormPreviewContentProps = OfflineEventPreviewContentProps & {
   isInDialog?: boolean
   handleCloseDialog?: () => void
   scale?: number
   contentHeight?: number
}

const OfflineEventFormPreviewContent = forwardRef<
   HTMLDivElement,
   OfflineEventFormPreviewContentProps
>(
   (
      {
         isInDialog = false,
         handleCloseDialog,
         scale,
         contentHeight,
         ...contentProps
      },
      ref
   ) => {
      const scaledStyles = useMemo(() => {
         if (!scale || isInDialog) return {}

         // Calculate the extra space that needs to be removed
         // When content is scaled down, the extra space is: contentHeight * (1 - scale)
         // We need to apply a negative margin to remove this extra space
         const extraSpace = contentHeight
            ? contentHeight * (1 - scale)
            : 100 * (1 - scale) // Fallback to base height estimate

         return {
            transformOrigin: "top left",
            "-webkit-transform": `scale(${scale})`,
            "-moz-transform": `scale(${scale})`,
            "-o-transform": `scale(${scale})`,
            transform: `scale(${scale})`,
            mb: `-${extraSpace}px`,
         }
      }, [scale, isInDialog, contentHeight])

      return (
         <Box ref={ref} sx={[styles.root, scaledStyles]}>
            {isInDialog ? (
               <Box sx={styles.closeButtonContainer}>
                  <IconButton onClick={handleCloseDialog}>
                     <CloseIcon sx={styles.closeIcon} />
                  </IconButton>
               </Box>
            ) : null}
            <Stack width="100%">
               <OfflineEventPreviewContent {...contentProps} />
            </Stack>
         </Box>
      )
   }
)

OfflineEventFormPreviewContent.displayName = "OfflineEventFormPreviewContent"

export default OfflineEventFormPreviewContent
