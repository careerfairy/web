import { sxStyles } from "@careerfairy/shared-ui"
import { Box, IconButton } from "@mui/material"
import MaximizeIcon from "components/views/group/admin/events/detail/form/views/preview/MaximizeIcon"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import { useRef } from "react"
import OfflineEventFormPreviewContent from "./OfflineEventFormPreviewContent"

const REAL_DIALOG_WIDTH = 915

const styles = sxStyles({
   root: {
      position: "relative",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      p: 2,
   },
   maximizeButton: {
      position: "absolute",
      margin: "8px",
      padding: 0,
      height: "38px",
      borderRadius: "40px",
      zIndex: 1,
   },
   maximizeIcon: {
      fontSize: 46,
   },
   preview: {
      padding: "48px 48px 48px 60px",
      maxWidth: `${REAL_DIALOG_WIDTH}px`,
      height: "100%",
      overflowY: "auto",
      backgroundColor: "#F7F8FC",
      borderRadius: "12px",
      ...NICE_SCROLLBAR_STYLES,
   },
})

type OfflineEventFormPreviewDesktopProps = {
   handleDialogOpen: () => void
}

const OfflineEventFormPreviewDesktop = ({
   handleDialogOpen,
}: OfflineEventFormPreviewDesktopProps) => {
   const previewRef = useRef<HTMLDivElement>(null)

   return (
      <Box sx={styles.root}>
         <IconButton sx={styles.maximizeButton} onClick={handleDialogOpen}>
            <MaximizeIcon sx={styles.maximizeIcon} />
         </IconButton>
         <Box sx={styles.preview}>
            <OfflineEventFormPreviewContent
               ref={previewRef}
               contentProps={{ detailsDirection: "column" }}
            />
         </Box>
      </Box>
   )
}

export default OfflineEventFormPreviewDesktop
