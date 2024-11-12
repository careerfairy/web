import { Box, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { HighlightComponentType } from "data/hygraph/types"
import { SyntheticEvent, useCallback, useState } from "react"
import ReactPlayer from "react-player"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   highlightCard: {
      position: "relative",
      width: 168,
      height: 298,
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
   highlightCardFullScreen: {
      width: "100dvw",
      height: "100dvh",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000,
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
   highlightCardHeader: {
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
   highlightCardHeaderFullScreen: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
   highlightVideoOverlay: {
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

const HighlightVideoOverlay = ({ hide }: { hide: boolean }) => {
   return <Box sx={[styles.highlightVideoOverlay, hide && { opacity: 0 }]} />
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

   const handleFullscreenClick = useCallback((event: SyntheticEvent) => {
      event.stopPropagation()
      event.preventDefault()
      setIsFullscreen((prev) => !prev)
   }, [])

   return (
      <Box
         sx={[
            styles.highlightCard,
            isFullscreen && styles.highlightCardFullScreen,
         ]}
         onClick={handleFullscreenClick}
      >
         <Box
            sx={[
               isFullscreen
                  ? styles.highlightCardHeaderFullScreen
                  : styles.highlightCardHeader,
            ]}
         >
            <Box sx={styles.highlightCardHeaderLogoContainer}>
               <CircularLogo
                  src={highlight.logo.url}
                  alt={highlight.logo.alt}
               />
            </Box>
            <Typography variant="small" sx={styles.highlightTitle}>
               {highlight.title}
            </Typography>
         </Box>
         <ReactPlayer
            url={highlight.videoClip.url}
            className="react-player"
            width="100%"
            height="100%"
            playing={isPlaying}
            onEnded={onEnded}
         />
         {isFullscreen ? (
            <HighlightVideoOverlay hide={false} />
         ) : (
            <HighlightVideoOverlay hide={false} />
         )}
      </Box>
   )
}
