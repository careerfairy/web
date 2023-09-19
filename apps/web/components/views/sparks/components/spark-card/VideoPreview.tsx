import PlayIcon from "@mui/icons-material/PlayArrowRounded"
import { CircularProgress, IconButton } from "@mui/material"
import Box from "@mui/material/Box"
import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import useReactPlayerTracker from "components/custom-hook/utils/useReactPlayerTracker"
import Image from "next/image"
import { FC, Fragment, useCallback, useEffect, useState } from "react"
import { BaseReactPlayerProps, OnProgressProps } from "react-player/base"
import ReactPlayer from "react-player/file"
import { sxStyles } from "types/commonTypes"

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
      "& svg": {
         width: 80,
         height: 80,
      },
   },
   thumbnailOverlay: {
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
})

type Props = {
   videoUrl: string
   thumbnailUrl: string
   playing?: boolean
   onSecondPassed?: (secondsPassed: number) => void
   onVideoEnded?: () => void
   onVideoPlay?: () => void
   pausing?: boolean
}

const VideoPreview: FC<Props> = ({
   videoUrl,
   thumbnailUrl,
   playing: shouldPLay,
   onSecondPassed,
   onVideoEnded,
   onVideoPlay,
   pausing: shouldPause,
}) => {
   const [videoPlayedForSession, setVideoPlayedForSession] = useState(false)
   const [progress, setProgress] = useState(0)
   const [browserAutoplayError, setBrowserAutoplayError] = useState(false)
   const [playing, setPlaying] = useState(shouldPLay)

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
      setBrowserAutoplayError(true)
      setPlaying(false)
   }

   useEffect(() => {
      if (!shouldPLay) {
         setVideoPlayedForSession(false)
      }
   }, [shouldPLay])

   const onPlay = useCallback(() => {
      setVideoPlayedForSession(true)
      if (!videoPlayedForSession) {
         onVideoPlay?.()
      }
   }, [onVideoPlay, videoPlayedForSession])

   const handleClickPlayOverlay = useCallback(() => {
      setPlaying(true)
      setBrowserAutoplayError(false)
   }, [])

   const handleClickPause = useCallback(() => {
      setPlaying((prevPlaying) => !prevPlaying)
   }, [])

   return (
      <Box sx={styles.root}>
         {browserAutoplayError ? (
            <ClickToPlayOverlay onClick={handleClickPlayOverlay} />
         ) : null}
         <Box sx={[styles.playerWrapper]}>
            <ReactPlayer
               playing={Boolean(playing && !shouldPause)}
               playsinline={playing}
               loop={playing}
               width="100%"
               height="100%"
               className="player"
               onProgress={handleProgress}
               onPlay={onPlay}
               onError={handleError}
               progressInterval={250}
               url={videoUrl}
               light={
                  shouldPLay ? null : <ThumbnailOverlay src={thumbnailUrl} />
               }
               playIcon={<Fragment />}
               onClick={handleClickPause}
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
const ClickToPlayOverlay: FC<ClickToPlayOverlayProps> = ({ onClick }) => {
   return (
      <Box sx={styles.clickToPlayOverlay} onClick={onClick}>
         <IconButton size="large" color="info">
            <PlayIcon />
         </IconButton>
      </Box>
   )
}

type ThumbnailOverlayProps = {
   src: string
   loading?: boolean
}
const ThumbnailOverlay: FC<ThumbnailOverlayProps> = ({ src, loading }) => {
   return (
      <Box sx={styles.thumbnailOverlay}>
         <Image
            src={src}
            layout="fill"
            objectFit="cover"
            alt="thumbnail"
            priority={true}
         />
         {loading ? <CircularProgress size={50} /> : null}
      </Box>
   )
}

export default VideoPreview
