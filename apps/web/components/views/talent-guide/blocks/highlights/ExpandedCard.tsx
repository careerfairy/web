import { Group } from "@careerfairy/shared-lib/groups"
import { Box, Dialog, IconButton } from "@mui/material"
import { HighlightComponentType } from "data/hygraph/types"
import { SyntheticEvent } from "react"
import { X as CloseIcon } from "react-feather"
import ReactPlayer from "react-player"
import { sxStyles } from "types/commonTypes"
import { ExpandedHeader } from "./ExpandedHeader"
import { HighlightVideoOverlay } from "./VideoOverlay"

const styles = sxStyles({
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
   closeDialog: {
      position: "absolute",
      top: {
         xs: 10,
         md: 20,
      },
      right: {
         xs: 25,
         md: 20,
      },
      zIndex: 3000,
      color: (theme) => theme.brand.white["50"],
   },
   desktopHeaderContainer: {
      width: "100%",
   },
})

type FullScreenProps = {
   highlight: HighlightComponentType
   group: Group
   onEnded: () => void
   onClose: (event: SyntheticEvent) => void
}

export const ExpandedMobile = ({
   highlight,
   group,
   onEnded,
   onClose,
}: FullScreenProps) => (
   <Box sx={styles.cardFullScreenMobile} onClick={onClose}>
      <IconButton onClick={onClose} sx={styles.closeDialog}>
         <CloseIcon size={24} />
      </IconButton>
      <ExpandedHeader highlight={highlight} group={group} />
      <ReactPlayer
         className="react-player"
         width="100%"
         height="100%"
         url={highlight.videoClip.url}
         playing
         onEnded={onEnded}
         playsinline
      />
      <HighlightVideoOverlay />
   </Box>
)

export const ExpandedDesktop = ({
   highlight,
   group,
   onEnded,
   onClose,
}: FullScreenProps) => (
   <Box sx={styles.desktopRoot} onClick={onClose}>
      <ReactPlayer
         url={highlight.videoClip.url}
         className="react-player"
         width="100%"
         height="100%"
         playing={false}
         onEnded={onEnded}
      />
      <Dialog open sx={styles.desktopDialog} maxWidth="desktop">
         <ReactPlayer
            url={highlight.videoClip.url}
            className="react-player"
            width="100%"
            height="100%"
            playing
            onEnded={onEnded}
            playsinline
         />
         <Box sx={styles.desktopHeaderContainer}>
            <ExpandedHeader highlight={highlight} group={group} />
            <HighlightVideoOverlay />
         </Box>
         <IconButton
            onClick={onClose}
            sx={styles.closeDialog}
            key="full-screen-close-button"
         >
            <CloseIcon size={24} />
         </IconButton>
      </Dialog>
   </Box>
)
