import { Fade, Grow, Button, Box } from "@mui/material"
import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import useReactPlayerTracker from "components/custom-hook/utils/useReactPlayerTracker"
import Image from "next/image"
import { FC, Fragment, useCallback, useEffect, useRef, useState } from "react"
import { BaseReactPlayerProps, OnProgressProps } from "react-player/base"
import ReactPlayer from "react-player/file"
import { useDispatch } from "react-redux"
import {
   setVideoPlaying,
   setVideosMuted,
} from "store/reducers/sparksFeedReducer"
import { sxStyles } from "types/commonTypes"
import UnmuteIcon from "@mui/icons-material/VolumeOff"
import { usePrevious } from "react-use"

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
            objectFit: {
               xs: "cover !important",
               sm: "contain !important",
            },
         },
         "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            // Provides a gradient overlay at the top and bottom of the card to make the text more readable.
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0) 17.71%), linear-gradient(180deg, rgba(0, 0, 0, 0) 82.29%, rgba(0, 0, 0, 0.60) 100%)`,
         },
      },
      "& .react-player__preview": {
         backgroundSize: "cover !important",
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
   clickToPlayOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: (theme) => theme.zIndex.drawer + 1,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
   },
   overlayButtonWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      p: 2,
   },
   hideOverlay: {
      background: "transparent",
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
      "& video": {
         objectFit: "cover",
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
   pausing?: boolean
   muted?: boolean
   light?: boolean
}

const VideoPreview: FC<Props> = ({
   videoUrl,
   playing: shouldPLay,
   onSecondPassed,
   onVideoEnded,
   onVideoPlay,
   pausing: shouldPause,
   thumbnailUrl,
   muted,
   light,
}) => {
   const playerRef = useRef<ReactPlayer | null>(null)
   const [videoPlayedForSession, setVideoPlayedForSession] = useState(false)
   const [progress, setProgress] = useState(0)
   const [playing, setPlaying] = useState(shouldPLay)
   const dispatch = useDispatch()

   const onProgress = useReactPlayerTracker({
      shouldPlay: shouldPLay,
      onSecondPass: onSecondPassed,
      onVideoEnd: onVideoEnded,
   })

   useEffect(() => {
      setPlaying(shouldPLay)
   }, [shouldPLay])

   const handleProgress = useCallback(
      (progress: OnProgressProps) => {
         setProgress(progress.played * 100)
         onProgress(progress)
      },
      [onProgress]
   )

   const handleError: BaseReactPlayerProps["onError"] = (error) => {
      dispatch(setVideosMuted(true))
      dispatch(setVideoPlaying(false))
      console.error(error)
   }

   useEffect(() => {
      if (!shouldPLay) {
         setVideoPlayedForSession(false)
      }
   }, [shouldPLay])

   const prevShouldPlay = usePrevious(shouldPLay)

   const reset = () => {
      setVideoPlayedForSession(false)
      setProgress(0)
      setPlaying(false)
      // reset player to
      playerRef.current?.seekTo(0)
   }

   useEffect(() => {
      if (prevShouldPlay && !shouldPLay) {
         reset()
      }
   }, [prevShouldPlay, shouldPLay])

   const onPlay = useCallback(() => {
      setVideoPlayedForSession(true)
      if (!videoPlayedForSession) {
         onVideoPlay?.()
      }
   }, [onVideoPlay, videoPlayedForSession])

   const handleClickPlayOverlay = useCallback(() => {
      dispatch(setVideosMuted(false))
      dispatch(setVideoPlaying(true))
      playerRef.current?.getInternalPlayer()?.play()
   }, [dispatch])

   const handleTogglePause = useCallback(() => {
      setPlaying((prevPlaying) => !prevPlaying)
   }, [])

   const playingVideo = Boolean(playing && !shouldPause)

   return (
      <Box sx={styles.root}>
         {muted ? (
            <ClickToUnmuteOverlay onClick={handleClickPlayOverlay} />
         ) : null}
         <Box
            onClick={handleTogglePause}
            sx={[styles.playerWrapper, light && styles.previewVideo]}
         >
            <ReactPlayer
               ref={playerRef}
               playing={playingVideo}
               playsinline
               playsInline
               loop={playing}
               width="100%"
               height="100%"
               className="player"
               onProgress={handleProgress}
               onPlay={onPlay}
               onError={handleError}
               progressInterval={250}
               url={videoUrl}
               // light={thumbnailUrl}
               // light={light ? thumbnailUrl : false}
               playIcon={<Fragment />}
               muted={muted}
            />
            <LinearProgress
               sx={styles.progress}
               variant="determinate"
               value={progress}
            />
         </Box>
      </Box>
   )
}

type ClickToPlayOverlayProps = {
   onClick: () => void
}
const ClickToUnmuteOverlay: FC<ClickToPlayOverlayProps> = ({ onClick }) => {
   const [hideOverlay, setHideOverlay] = useState(false)

   useEffect(() => {
      const timer = setTimeout(() => {
         setHideOverlay(false)
      }, 5000)
      return () => {
         clearTimeout(timer)
      }
   }, [])

   return (
      <Fade in>
         <Box
            sx={[styles.clickToPlayOverlay, hideOverlay && styles.hideOverlay]}
            onClick={onClick}
         >
            <Box sx={styles.overlayButtonWrapper}>
               <Grow in={!hideOverlay}>
                  <span>
                     <Button
                        variant="contained"
                        color="info"
                        startIcon={<UnmuteIcon />}
                     >
                        Tap to unmute
                     </Button>
                  </span>
               </Grow>
            </Box>
         </Box>
      </Fade>
   )
}

type ThumbnailOverlayProps = {
   src: string
}
export const ThumbnailOverlay: FC<ThumbnailOverlayProps> = ({ src }) => {
   return (
      <Box sx={styles.thumbnailOverlay}>
         <Image
            src={src}
            layout="fill"
            objectFit="cover"
            alt="thumbnail"
            priority={true}
         />
      </Box>
   )
}

export default VideoPreview
