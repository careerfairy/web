import { Group } from "@careerfairy/shared-lib/groups"
import { Box, Typography } from "@mui/material"
import useGroup from "components/custom-hook/group/useGroup"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { HighlightComponentType } from "data/hygraph/types"
import { SyntheticEvent, useCallback, useState } from "react"
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
   cardFullScreen: {
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000,
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
         "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 40%, rgba(0, 0, 0, 0.60) 100%), transparent",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 0,
   },
})

const HighlightVideoOverlay = () => {
   return <Box sx={styles.videoOverlay} />
}

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

   return (
      <Box
         sx={[isFullscreen ? styles.cardFullScreen : styles.card]}
         onClick={handleFullscreenClick}
      >
         {isFullscreen ? (
            <FullScreenHeader highlight={highlight} group={group} />
         ) : (
            <NonFullscreenHeader highlight={highlight} group={group} />
         )}
         <ReactPlayer
            url={highlight.videoClip.url}
            className="react-player"
            width="100%"
            height="100%"
            playing={isPlaying}
            onEnded={onEnded}
         />
         <HighlightVideoOverlay />
      </Box>
   )
}
