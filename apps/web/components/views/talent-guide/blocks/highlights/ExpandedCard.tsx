import { Box, Dialog, IconButton } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SyntheticEvent, forwardRef } from "react"
import { X as CloseIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useHighlights } from "./control/HighlightsBlockContext"

const styles = sxStyles({
   keepLayoutInPlace: {
      // Ensures the grid layout doesn't change, otherwise it would add an empty grid item
      position: "absolute",
   },
   desktopRoot: {
      position: "relative",
      width: {
         xs: 168,
         md: 220,
      },
      aspectRatio: 9 / 16,
      display: "flex",
      padding: "12px 8px",
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "center",
      borderRadius: "8px",
      overflow: "hidden",
      gap: "8px",
      userSelect: "none",
      "& .react-player": {
         position: "absolute",
         top: 0,
         left: 0,
         zIndex: 0,
      },
   },
   desktopDialog: {
      width: "100%",
      "& .MuiDialog-paper": {
         overflow: "hidden !important",
         alignItems: "center",
         justifyContent: "center",
         height: "80vh",
      },
      "& .react-player": {
         display: "flex",
      },
   },
   cardFullScreenMobile: {
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1300,
      width: "100dvw",
      height: "100dvh",
      borderRadius: 0,
      right: "12px !important",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      "& .react-player": {
         position: "relative",
         width: "max(100dvw, 177.78dvh) !important",
         height: "max(100dvh, 177.78dvw) !important",
      },
   },
   closeButton: {
      position: "absolute",
      top: {
         xs: 10,
         md: 20,
      },
      right: {
         xs: 10,
         md: 20,
      },
      zIndex: 3000,
      color: (theme) => theme.brand.white["50"],
   },
})

type ExpandedProps = {
   ref?: React.RefObject<HTMLDivElement>
   onClose: (event: SyntheticEvent) => void
   children: React.ReactNode
}

const CloseButton = ({ onClose }: { onClose: ExpandedProps["onClose"] }) => (
   <IconButton
      onClick={onClose}
      sx={styles.closeButton}
      key="full-screen-close-button"
   >
      <CloseIcon size={24} />
   </IconButton>
)

const Mobile = ({ onClose, children }: ExpandedProps) => (
   <Box sx={styles.cardFullScreenMobile}>
      <CloseButton onClose={onClose} />
      {children}
   </Box>
)

const Desktop = forwardRef<HTMLDivElement, ExpandedProps>(
   ({ onClose, children }, ref) => (
      <Box sx={styles.desktopRoot} ref={ref}>
         <Dialog
            open
            sx={styles.desktopDialog}
            maxWidth="desktop"
            onClose={onClose}
            PaperProps={{ ref }}
         >
            <CloseButton onClose={onClose} />
            {children}
         </Dialog>
      </Box>
   )
)

Desktop.displayName = "ExpandedCard.Desktop"

export const ExpandedCard = forwardRef<HTMLDivElement, ExpandedProps>(
   (props, ref) => {
      const isMobile = useIsMobile()
      const { toggleExpandedPlaying } = useHighlights()

      return (
         <Box sx={styles.keepLayoutInPlace} onClick={toggleExpandedPlaying}>
            {isMobile ? (
               <Mobile {...props} />
            ) : (
               <Desktop {...props} ref={ref} />
            )}
         </Box>
      )
   }
)

ExpandedCard.displayName = "ExpandedCard"
