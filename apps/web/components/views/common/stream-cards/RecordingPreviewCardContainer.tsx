import Box from "@mui/material/Box"
import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import useIsMobile from "components/custom-hook/useIsMobile"
import React, { FC, useCallback } from "react"
import { Volume2, VolumeX } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { useEventPreviewCardContext } from "./EventPreviewCardContext"
import RecordingCardPlayer from "./RecordingCardPlayer"

export const SPARK_DESKTOP_WIDTH = 232
export const SPARK_MOBILE_WIDTH = 200

const styles = sxStyles({
   root: {
      color: "white",
      display: "flex",
      objectFit: "cover",
      position: "relative",
      flexDirection: "column",
      overflow: "hidden",
      aspectRatio: "16/9",
      borderRadius: "8px",
   },
   cardContent: {
      zIndex: 1,
      display: "flex",
      flexDirection: "column",
      flex: 1,
      position: "relative",
   },
   muteButton: {
      display: "inline-flex",
      padding: "8px",
      alignItems: "center",
      gap: "10px",
      borderRadius: "56px",
      background: "rgba(31, 31, 35, 0.40)",
      position: "absolute",
      top: "10px",
      right: "8px",
      zIndex: 1,
      pointerEvents: "auto",
   },
   muteIcon: {
      width: "20px",
      height: "20px",
      color: (theme) => theme.brand.white[100],
      backdropFilter: "none !important",
   },
   progress: {
      background: "none",
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      [`& .${linearProgressClasses.bar}`]: {
         bgcolor: "primary.600",
         borderRadius: "0px 34px 34px 34px",
      },
      [`&.${linearProgressClasses.colorPrimary}`]: {
         backgroundColor: "rgba(205, 205, 205, 0.95)",
      },
      zIndex: 2,
      height: 6,
   },
})

type Props = {
   componentHeader?: React.ReactNode
   children?: React.ReactNode
   video: {
      thumbnailUrl: string
      url: string
      preview: boolean
      startAt?: number
      percentWatched?: number
   }
   onVideoEnded?: () => void
   autoPlaying?: boolean
   containerRef?: (node?: Element | null) => void
   onSecondPassed?: (secondsPassed: number) => void
}

const RecordingPreviewCardContainer: FC<Props> = ({
   componentHeader,
   children,
   video,
   autoPlaying,
   containerRef,
   onVideoEnded,
   onSecondPassed,
}) => {
   const isMobile = useIsMobile()
   const { setAutoPlaying, setMuted, muted, livestream } =
      useEventPreviewCardContext()

   const handleMouseEnter = useCallback(() => {
      if (!isMobile) {
         setAutoPlaying(true)
         dataLayerLivestreamEvent(AnalyticsEvents.RecordingAutoplay, livestream)
      }
   }, [isMobile, setAutoPlaying, livestream])

   const handleMouseLeave = useCallback(() => {
      if (!isMobile) {
         setAutoPlaying(false)
      }
   }, [isMobile, setAutoPlaying])

   const handleMuteToggle = useCallback(
      (e: React.MouseEvent) => {
         e.stopPropagation()
         e.preventDefault()
         setMuted(!muted)
      },
      [muted, setMuted]
   )

   return (
      <Box
         ref={containerRef}
         sx={styles.root}
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
      >
         {componentHeader ? componentHeader : null}
         <Box sx={styles.cardContent}>{children}</Box>
         <RecordingCardPlayer
            key={`${video.url}-${isMobile ? "mobile" : "desktop"}`}
            thumbnailUrl={video.thumbnailUrl}
            videoUrl={video.url}
            pausing={!autoPlaying}
            playing={autoPlaying}
            autoPlaying={autoPlaying}
            muted={muted}
            identifier={video.url}
            preview={video.preview}
            onSecondPassed={onSecondPassed}
            onVideoEnded={onVideoEnded}
            startAt={video.startAt}
         />
         {!video.preview && video?.percentWatched > 1 ? (
            <LinearProgress
               sx={styles.progress}
               variant="determinate"
               value={video.percentWatched}
            />
         ) : null}
         {Boolean(autoPlaying) && (
            <Box sx={styles.muteButton} onClick={handleMuteToggle}>
               <Box
                  component={muted ? VolumeX : Volume2}
                  sx={styles.muteIcon}
               />
            </Box>
         )}
      </Box>
   )
}

export default RecordingPreviewCardContainer
