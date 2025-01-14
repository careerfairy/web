import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { Box } from "@mui/material"
import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import useReactPlayerTracker from "components/custom-hook/utils/useReactPlayerTracker"
import Image from "next/image"
import { FC, Fragment, useCallback, useEffect, useRef, useState } from "react"
import { BaseReactPlayerProps, OnProgressProps } from "react-player/base"
import ReactPlayer from "react-player/file"
import { useDispatch } from "react-redux"
import { usePrevious } from "react-use"
import { setVideosMuted } from "store/reducers/sparksFeedReducer"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"

const styles = sxStyles({
   root: {
      position: "absolute",
      inset: 0,
   },
   playerWrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
      "& .player": {
         position: "absolute",
         top: 0,
         left: 0,
         "& video": {
            background: "black",
            objectFit: "cover !important",
         },
      },
      "& .react-player__preview": {
         backgroundSize: {
            xs: "cover !important",
            sm: "contain !important",
         },
         backgroundRepeat: "no-repeat !important",
         backgroundColor: "black !important",
      },
   },
   progress: {
      background: "none",
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      [`& .${linearProgressClasses.bar}`]: {
         bgcolor: "primary.600",
      },
      zIndex: (theme) => theme.zIndex.drawer + 1,
      height: 4.5,
   },

   thumbnailOverlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   previewVideo: {
      "& .react-player__preview": {
         backgroundSize: {
            sm: "cover !important",
         },
      },
      "& .player": {
         "& video": {
            objectFit: {
               sm: "cover !important",
            },
         },
      },
   },
   withOverlay: {
      "&::after": {
         zIndex: 1,
         content: '""',
         position: "absolute",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
         // Provides a gradient overlay at the top and bottom of the card to make the text more readable.
         background: `linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0.00) 17.71%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 49.57%, rgba(0, 0, 0, 0.60) 100%)`,
      },
   },
})

type Props = {
   videoUrl: string
   thumbnailUrl?: string
   playing?: boolean
   onSecondPassed?: (secondsPassed: number) => void
   onVideoEnded?: () => void
   onVideoPlay?: () => void
   onPercentagePlayed?: (percentagePlayed: number) => void
   pausing?: boolean
   muted?: boolean
   light?: boolean
   containPreviewOnTablet?: boolean
   identifier?: string
   autoPlaying?: boolean
}

const VideoPreview: FC<Props> = ({
   videoUrl,
   playing,
   onSecondPassed,
   onVideoEnded,
   onVideoPlay,
   onPercentagePlayed,
   pausing: shouldPause,
   thumbnailUrl,
   muted,
   light,
   containPreviewOnTablet,
   identifier,
   autoPlaying,
}) => {
   const playerRef = useRef<ReactPlayer | null>(null)
   const [videoPlayedForSession, setVideoPlayedForSession] = useState(false)
   const [progress, setProgress] = useState(0)
   const dispatch = useDispatch()
   const [isVideoReady, setIsVideoReady] = useState(false)

   const onProgress = useReactPlayerTracker({
      identifier,
      onSecondPass: onSecondPassed,
      onVideoEnd: onVideoEnded,
   })

   const handleError: BaseReactPlayerProps["onError"] = useCallback(
      (error) => {
         dispatch(setVideosMuted(true))
         playerRef.current?.getInternalPlayer()?.play()

         errorLogAndNotify(error, {
            message: "Error playing video",
            videoUrl,
            error: JSON.stringify(error, null, 2),
            videoShouldBeMuted: muted,
         })
      },
      [dispatch, videoUrl, muted]
   )

   const handleProgress = useCallback(
      (progress: OnProgressProps) => {
         // only track and show the progress if it's not auto-played
         if (!autoPlaying) {
            setProgress(progress.played * 100)
            onProgress(progress)
            onPercentagePlayed?.(progress.played)
         }
      },
      [autoPlaying, onPercentagePlayed, onProgress]
   )

   const prevIdentifier = usePrevious(identifier)

   const reset = () => {
      setVideoPlayedForSession(false)
      setProgress(0)
      playerRef.current?.seekTo(0)
   }

   const playingVideo = Boolean(playing && !shouldPause)

   // checks for tab switch/minimize in browser, stops the preview video from playing force the carousel to remount
   useEffect(() => {
      const handleVisibilityChange = () => {
         if (document.visibilityState === "visible" && playingVideo) {
            playerRef.current?.getInternalPlayer()?.play()
         }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)
      return () => {
         document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
         )
      }
   }, [playingVideo])

   useEffect(() => {
      if (prevIdentifier !== identifier) {
         reset()
      }
   }, [identifier, prevIdentifier])

   useEffect(() => {
      if (autoPlaying === false) {
         reset()
      }
   }, [autoPlaying])

   // Set up an interval to reset the video if auto-played for more than {SECONDS_TO_AUTO_PLAY} seconds
   useEffect(() => {
      let interval: NodeJS.Timeout | null = null

      const handleAutoPlayReset = () => {
         if (autoPlaying) {
            interval = setInterval(() => {
               reset()
            }, SPARK_CONSTANTS.SECONDS_TO_AUTO_PLAY)
         } else {
            if (interval) {
               clearInterval(interval)
            }
         }
      }

      handleAutoPlayReset()

      return () => {
         clearInterval(interval)
      }
   }, [autoPlaying])

   const onPlay = useCallback(() => {
      setIsVideoReady(true)
      setVideoPlayedForSession(true)
      if (!videoPlayedForSession) {
         onVideoPlay?.()
      }
   }, [onVideoPlay, videoPlayedForSession])

   return (
      <Box sx={[styles.root, styles.withOverlay]}>
         <Box
            sx={[
               styles.playerWrapper,
               light && !containPreviewOnTablet && styles.previewVideo,
            ]}
         >
            <ThumbnailOverlay
               src={thumbnailUrl}
               containPreviewOnTablet={containPreviewOnTablet}
               hide={!light && isVideoReady}
            />

            {light ? null : (
               <ReactPlayer
                  ref={playerRef}
                  playing={playingVideo}
                  playsinline
                  loop={playing}
                  width="100%"
                  height="100%"
                  className="player"
                  onProgress={handleProgress}
                  onPlay={onPlay}
                  onError={handleError}
                  progressInterval={250}
                  url={videoUrl}
                  playIcon={<Fragment />}
                  muted={muted}
                  style={{ visibility: isVideoReady ? "visible" : "hidden" }}
               />
            )}
         </Box>
         <LinearProgress
            sx={styles.progress}
            variant="determinate"
            value={progress}
         />
      </Box>
   )
}

type ThumbnailOverlayProps = {
   src: string
   containPreviewOnTablet?: boolean
   hide?: boolean
}

export const ThumbnailOverlay: FC<ThumbnailOverlayProps> = ({
   src,
   containPreviewOnTablet,
   hide,
}) => {
   const theme = useTheme()
   const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))

   return (
      <Box sx={[styles.thumbnailOverlay, { zIndex: hide ? 0 : 1 }]}>
         <Image
            src={src}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={40}
            style={{
               objectFit: containPreviewOnTablet
                  ? isSmallScreen
                     ? "cover"
                     : "contain"
                  : "cover",
            }}
            alt="thumbnail"
            priority={true}
         />
      </Box>
   )
}

export default VideoPreview
