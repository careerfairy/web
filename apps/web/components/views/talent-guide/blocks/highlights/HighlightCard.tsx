import { Group } from "@careerfairy/shared-lib/groups"
import { Box, Dialog, IconButton, Typography } from "@mui/material"
import useGroup from "components/custom-hook/group/useGroup"
import useIsMobile from "components/custom-hook/useIsMobile"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { HighlightComponentType } from "data/hygraph/types"
import { SyntheticEvent, useCallback, useState } from "react"
import { X as CloseIcon } from "react-feather"
import ReactPlayer from "react-player"
import { sxStyles } from "types/commonTypes"
import { FullScreenHeader } from "./FullScreenHeader"

const styles = sxStyles({
   card: {
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
         zIndex: -1,
      },
   },
   fullScreenDialog: {
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
   cardHeader: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
      zIndex: 2,
      position: "absolute",
      bottom: "12px",
      left: 0,
      width: "100%",
   },
   highlightCardHeaderLogoContainer: {
      cursor: "pointer",
   },
   highlightTitle: {
      color: "#FFF",
      textAlign: "center",
      fontSize: 14,
      fontWeight: 600,
      lineHeight: "20px",
   },
   videoOverlay: {
      width: "100%",
      height: "100%",
      background:
         "linear-gradient(180deg, rgba(0, 0, 0, 0) 78.12%, rgba(0, 0, 0, 0.6) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 17.71%)",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1,
   },
   fullScreenCloseButton: {
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
      color: "#FFF",
   },
})

const HighlightVideoOverlay = () => {
   return <Box sx={styles.videoOverlay} key="video-overlay" />
}

const DEFAULT_PLAYER_PROPS = {
   className: "react-player",
   width: "100%",
   height: "100%",
}

type FullScreenProps = {
   highlight: HighlightComponentType
   group: Group
   isPlaying: boolean
   onEnded: () => void
   onClose: (event: SyntheticEvent) => void
}

const FullscreenMobileView = ({
   highlight,
   group,
   isPlaying,
   onEnded,
   onClose,
}: FullScreenProps) => (
   <Box sx={styles.cardFullScreenMobile} onClick={onClose}>
      <IconButton onClick={onClose} sx={styles.fullScreenCloseButton}>
         <CloseIcon size={24} />
      </IconButton>
      <FullScreenHeader highlight={highlight} group={group} />
      <ReactPlayer
         {...DEFAULT_PLAYER_PROPS}
         url={highlight.videoClip.url}
         playing={isPlaying}
         onEnded={onEnded}
      />
      <HighlightVideoOverlay />
   </Box>
)

const FullscreenDesktopView = ({
   highlight,
   group,
   isPlaying,
   onEnded,
   onClose,
}: FullScreenProps) => (
   <Box sx={styles.card} onClick={onClose}>
      <ReactPlayer
         url={highlight.videoClip.url}
         {...DEFAULT_PLAYER_PROPS}
         playing={false}
         onEnded={onEnded}
      />
      <Dialog open sx={styles.fullScreenDialog} maxWidth="desktop">
         <ReactPlayer
            url={highlight.videoClip.url}
            {...DEFAULT_PLAYER_PROPS}
            playing={isPlaying}
            onEnded={onEnded}
         />
         <Box sx={{ width: "100%" }}>
            <FullScreenHeader highlight={highlight} group={group} />
            <HighlightVideoOverlay />
         </Box>
         <IconButton
            onClick={onClose}
            sx={styles.fullScreenCloseButton}
            key="full-screen-close-button"
         >
            <CloseIcon size={24} />
         </IconButton>
      </Dialog>
   </Box>
)

const NonFullscreenHeader = ({
   group,
   highlight,
}: {
   group: Group
   highlight: HighlightComponentType
}) => {
   return (
      <Box sx={styles.cardHeader}>
         <Box sx={styles.highlightCardHeaderLogoContainer}>
            <CircularLogo
               src={group?.logoUrl}
               alt={`${group?.universityName} logo`}
            />
         </Box>
         <Typography variant="small" sx={styles.highlightTitle}>
            {highlight.title}
         </Typography>
      </Box>
   )
}

export const HighlightCard = ({
   highlight,
   isPlaying,
   onEnded,
}: {
   highlight: HighlightComponentType
   isPlaying: boolean
   onEnded: () => void
}) => {
   const isMobile = useIsMobile()
   const [isFullscreen, setIsFullscreen] = useState(false)

   const { data: group, status } = useGroup(
      highlight.companyIdentifier.identifier
   )

   const handleFullscreenClick = useCallback((event: SyntheticEvent) => {
      event.stopPropagation()
      event.preventDefault()
      setIsFullscreen((prev) => !prev)
   }, [])

   if (status === "error" || status === "loading") return null

   if (isFullscreen && isMobile) {
      return (
         <FullscreenMobileView
            highlight={highlight}
            group={group}
            isPlaying={isPlaying}
            onEnded={onEnded}
            onClose={handleFullscreenClick}
         />
      )
   } else if (isFullscreen && !isMobile) {
      return (
         <FullscreenDesktopView
            highlight={highlight}
            group={group}
            isPlaying={isPlaying}
            onEnded={onEnded}
            onClose={handleFullscreenClick}
         />
      )
   }

   // Thumbnail view
   return (
      <Box sx={styles.card} onClick={handleFullscreenClick}>
         <NonFullscreenHeader highlight={highlight} group={group} />
         <ReactPlayer
            url={highlight.videoClip.url}
            {...DEFAULT_PLAYER_PROPS}
            playing={Boolean(isPlaying && !isFullscreen)}
            onEnded={onEnded}
         />
         <HighlightVideoOverlay />
      </Box>
   )
}
