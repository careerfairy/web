import { Box, Stack, Typography } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import CircularLogo from "components/views/common/logos/CircularLogo"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { HighlightComponentType } from "data/hygraph/types"
import {
   RefObject,
   SyntheticEvent,
   useCallback,
   useEffect,
   useRef,
   useState,
} from "react"
import { Video } from "react-feather"
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
   highlightCardHeaderContainerFullScreen: {
      display: "flex",
      flexDirection: "column",
      zIndex: 2,
      gap: "12px",
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      padding: "0 16px 16px 16px",
      color: "#FEFEFE",
   },
   highlightCardHeaderFullScreen: {
      display: "flex",
      alignItems: "center",
      gap: 1,
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
   highlightTitleFullScreen: {
      fontSize: 16,
      fontWeight: 600,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
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
   livestreamTitle: {
      overflowX: "hidden",
      display: "flex",
   },
})

const getScrollAnimationStyle = (
   titleRef: RefObject<HTMLDivElement>,
   parentRef: RefObject<HTMLDivElement>
) => {
   if (!titleRef.current || !parentRef.current) return []

   const isOverflowing =
      titleRef.current.clientWidth > parentRef.current.clientWidth

   if (!isOverflowing) return []

   const overflownWidth =
      titleRef.current.clientWidth - parentRef.current.clientWidth + 10

   return [
      {
         animationName: "scrollToEnd",
         animationTimingFunction: "linear",
         animationIterationCount: "infinite",
         animationDuration: "5s",
         animationDelay: "1s",
      },
      {
         "@keyframes scrollToEnd": {
            "0%": {
               transform: "translateX(0)",
            },
            "40%, 50%": {
               transform: `translateX(-${overflownWidth}px)`,
            },
            "90%, 100%": {
               transform: "translateX(0)",
            },
         },
      },
   ]
}

const HighlightVideoOverlay = () => {
   return <Box sx={styles.highlightVideoOverlay} />
}

const FullscreenHeader = ({
   highlight,
}: {
   highlight: HighlightComponentType
}) => {
   const titleRef = useRef<HTMLDivElement>(null)
   const parentRef = useRef<HTMLDivElement>(null)
   const [animationStyle, setAnimationStyle] = useState([])

   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()

   const handleLivestreamTitleClick = useCallback(
      (event: SyntheticEvent) => {
         event.stopPropagation()
         event.preventDefault()
         handleOpen()
      },
      [handleOpen]
   )

   useEffect(() => {
      if (titleRef.current || parentRef.current) {
         setAnimationStyle(getScrollAnimationStyle(titleRef, parentRef))
      }
   }, [titleRef, parentRef])

   return (
      <Box sx={styles.highlightCardHeaderContainerFullScreen}>
         <Box sx={styles.highlightCardHeaderFullScreen}>
            <Box sx={styles.highlightCardHeaderLogoContainer}>
               <CircularLogo
                  src={highlight.logo.url}
                  alt={highlight.logo.alt}
               />
            </Box>
            <Typography variant="small" sx={styles.highlightTitleFullScreen}>
               {highlight.title}
            </Typography>
         </Box>
         <Stack
            direction="row"
            gap={1}
            alignItems="center"
            onClick={handleLivestreamTitleClick}
         >
            <Video size={16} />
            <Box sx={styles.livestreamTitle} ref={parentRef}>
               <Typography
                  ref={titleRef}
                  variant="small"
                  sx={[{ whiteSpace: "nowrap" }, ...animationStyle]}
               >
                  {highlight.liveStreamIdentifier.identifier}{" "}
                  {highlight.liveStreamIdentifier.identifier}{" "}
                  {highlight.liveStreamIdentifier.identifier} THE END.
               </Typography>
            </Box>
         </Stack>
         <Box
            onClick={(event) => {
               event.stopPropagation()
               event.preventDefault()
            }}
         >
            <LivestreamDialog
               open={isOpen}
               livestreamId={highlight.liveStreamIdentifier.identifier}
               handleClose={handleClose}
               page={"details"}
               serverUserEmail={""}
            />
         </Box>
      </Box>
   )
}

const NonFullscreenHeader = ({
   highlight,
}: {
   highlight: HighlightComponentType
}) => {
   return (
      <Box sx={styles.highlightCardHeader}>
         <Box sx={styles.highlightCardHeaderLogoContainer}>
            <CircularLogo src={highlight.logo.url} alt={highlight.logo.alt} />
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
         {isFullscreen ? (
            <FullscreenHeader highlight={highlight} />
         ) : (
            <NonFullscreenHeader highlight={highlight} />
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
