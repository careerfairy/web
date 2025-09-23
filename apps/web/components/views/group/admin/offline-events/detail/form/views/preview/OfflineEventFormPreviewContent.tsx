import { sxStyles } from "@careerfairy/shared-ui"
import CloseIcon from "@mui/icons-material/CloseRounded"
import { Box, IconButton, Stack } from "@mui/material"
import { forwardRef } from "react"
import {
   OfflineEventPreviewContent,
   OfflineEventPreviewContentProps,
} from "./OfflineEventPreviewContent"

const styles = sxStyles({
   root: {
      backgroundColor: (theme) => theme.brand.black[500],
      borderRadius: 3,
      padding: 0,
      // minHeight: 400,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
   },
   placeholder: {
      color: "text.secondary",
      textAlign: "center",
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
}

const OfflineEventFormPreviewContent = forwardRef<
   HTMLDivElement,
   OfflineEventFormPreviewContentProps
>(({ isInDialog = false, handleCloseDialog, ...contentProps }, ref) => {
   return (
      <Box ref={ref} sx={styles.root}>
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
})

OfflineEventFormPreviewContent.displayName = "OfflineEventFormPreviewContent"

export default OfflineEventFormPreviewContent
