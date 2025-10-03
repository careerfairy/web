import { sxStyles } from "@careerfairy/shared-ui"
import { Box, IconButton } from "@mui/material"
import MaximizeIcon from "components/views/group/admin/events/detail/form/views/preview/MaximizeIcon"
import { useEffect, useMemo, useRef, useState } from "react"
import OfflineEventFormPreviewContent from "./OfflineEventFormPreviewContent"

const PREVIEW_COLUMN_PADDING_Y = 48

const getStyles = (responsiveHeight: string) =>
   sxStyles({
      root: {
         height: responsiveHeight,
         maxHeight: "calc(100dvh - 96px)",
         minHeight: "calc(100dvh - 96px)",
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
         padding: "30px 48px 48px 66px",
         minWidth: `800px`,
         backgroundColor: "#F7F8FC",
         borderRadius: "12px",
         overflowY: "scroll",
         maxHeight: "calc(100dvh - 96px)",
      },
   })

type OfflineEventFormPreviewDesktopProps = {
   handleDialogOpen: () => void
   scale: number
}

const OfflineEventFormPreviewDesktop = ({
   handleDialogOpen,
   scale,
}: OfflineEventFormPreviewDesktopProps) => {
   const previewRef = useRef<HTMLDivElement>(null)
   const [previewCalculatedHeight, setPreviewCalculatedHeight] = useState<
      number | null
   >(null)
   const [contentHeight, setContentHeight] = useState<number | null>(null)

   const styles = useMemo(
      () =>
         getStyles(
            previewCalculatedHeight
               ? Math.max(
                    previewCalculatedHeight + PREVIEW_COLUMN_PADDING_Y * 2,
                    300 // Minimum height to prevent too small containers
                 ) + "px"
               : "auto" // Let content determine height naturally
         ),
      [previewCalculatedHeight]
   )

   useEffect(() => {
      const updateFormHeight = () => {
         if (previewRef.current) {
            // Get the actual content height before scaling
            const actualContentHeight = previewRef.current.scrollHeight
            setContentHeight(actualContentHeight)

            // Apply scale to get the actual rendered height
            const scaledHeight = actualContentHeight * scale
            setPreviewCalculatedHeight(scaledHeight)
         }
      }

      // this is to ensure the CSS transform scaling executes
      const timeoutId = setTimeout(() => {
         updateFormHeight()
         window.addEventListener("resize", updateFormHeight)
      }, 200)

      return () => {
         clearTimeout(timeoutId)
         window.removeEventListener("resize", updateFormHeight)
      }
   }, [scale]) // Recalculate when scale changes

   return (
      <Box sx={styles.root}>
         <IconButton sx={styles.maximizeButton} onClick={handleDialogOpen}>
            <MaximizeIcon sx={styles.maximizeIcon} />
         </IconButton>
         <Box sx={styles.preview}>
            <OfflineEventFormPreviewContent
               ref={previewRef}
               scale={scale}
               contentHeight={contentHeight}
               // detailsDirection="column"
               showHeaderIcons
            />
         </Box>
      </Box>
   )
}

export default OfflineEventFormPreviewDesktop
