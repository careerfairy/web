import { Box, Collapse, Typography } from "@mui/material"
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
      width: "100vw",
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000,
      borderRadius: 0,
      right: "12px !important",
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
      transition: "all 0.3s ease-in-out",
   },
   highlightCardHeaderFullScreen: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      zIndex: 2,
      transition: "all 0.3s ease-in-out",
   },
   highlightCardHeaderMoved: {
      transform: "scale(0.7)",
      left: "30%",
      bottom: 0,
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
      transition: "opacity 0.3s ease-in-out",
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

   const handleHeaderClick = useCallback((event: SyntheticEvent) => {
      event.stopPropagation()
      event.preventDefault()
      alert("clicked header")
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
               isPlaying && !isFullscreen && styles.highlightCardHeaderMoved,
            ]}
         >
            <Box
               sx={styles.highlightCardHeaderLogoContainer}
               onClick={handleHeaderClick}
            >
               <CircularLogo
                  src={highlight.logo.url}
                  alt={highlight.logo.alt}
               />
            </Box>
            <Typography
               variant="small"
               sx={styles.highlightTitle}
               onClick={(event) => {
                  event.stopPropagation()
                  event.preventDefault()
               }}
            >
               {isFullscreen ? (
                  highlight.title
               ) : (
                  <Collapse in={!isPlaying} timeout={300}>
                     {highlight.title}
                  </Collapse>
               )}
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
            <Collapse in={!isPlaying} timeout={300}>
               <HighlightVideoOverlay hide={isPlaying} />
            </Collapse>
         )}
      </Box>
   )
}
