import { Box, Fade } from "@mui/material"
import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import Image from "next/image"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import { BaseReactPlayerProps, OnProgressProps } from "react-player/base"
import ReactPlayer from "react-player/file"
import { usePrevious } from "react-use"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"

const styles = sxStyles({
   root: {
      position: "absolute",
      inset: 0,
      borderRadius: "8px",
      overflow: "hidden",
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
            background: "white",
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
      zIndex: 2,
      height: 4.5,
   },
   thumbnailOverlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&::after": {
         content: '""',
         position: "absolute",
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
         borderRadius: "8px",
         background:
            "linear-gradient(0deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.25) 100%)",
      },
   },
})

type Props = {
   videoUrl: string
   thumbnailUrl?: string
   playing?: boolean
   pausing?: boolean
   muted?: boolean
   containPreviewOnTablet?: boolean
   identifier?: string
   autoPlaying?: boolean
   preview?: boolean
   onSecondPassed?: (secondsPassed: number) => void
   onVideoEnded?: () => void
}

const RecordingCardPlayer: FC<Props> = ({
   videoUrl,
   playing,
   pausing: shouldPause,
   thumbnailUrl,
   muted,
   identifier,
   autoPlaying,
   preview,
   onSecondPassed,
   onVideoEnded,
}) => {
   const playerRef = useRef<ReactPlayer | null>(null)
   const [isVideoReady, setIsVideoReady] = useState(false)

   const prevIdentifier = usePrevious(identifier)
   const playingVideo = Boolean(playing && !shouldPause)

   const reset = useCallback(() => {
      playerRef.current?.seekTo(0)
   }, [])

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
      if (prevIdentifier !== undefined && prevIdentifier !== identifier) {
         reset()
      }
   }, [identifier, prevIdentifier, reset])

   useEffect(() => {
      if (autoPlaying === false) {
         reset()
      }
   }, [autoPlaying, reset])

   useEffect(() => {
      if (autoPlaying) {
         // if previewing, tease at 10% of the video, otherwise skip initial 8 seconds loading time
         playerRef.current?.seekTo(preview ? 0.1 : 8)
      }
   }, [autoPlaying, preview])

   return (
      <Box sx={[styles.root]}>
         <Box sx={styles.playerWrapper}>
            {Boolean(playingVideo) && ( // only render the video player when playing for better performance
               <Fade in={isVideoReady} timeout={200}>
                  <Box height="100%">
                     <RecordingPlayer
                        videoUrl={videoUrl}
                        playerRef={playerRef}
                        isVideoReady={isVideoReady}
                        setIsVideoReady={setIsVideoReady}
                        playingVideo={playingVideo}
                        muted={muted}
                        preview={preview}
                        onSecondPassed={onSecondPassed}
                        onVideoEnded={onVideoEnded}
                     />
                  </Box>
               </Fade>
            )}
            <Fade in={!isVideoReady || !playingVideo} timeout={200}>
               <Box height="100%">
                  <ThumbnailOverlay src={thumbnailUrl} />
               </Box>
            </Fade>
         </Box>
      </Box>
   )
}

type ThumbnailOverlayProps = {
   src: string
}

export const ThumbnailOverlay: FC<ThumbnailOverlayProps> = ({ src }) => {
   return (
      <Box sx={[styles.thumbnailOverlay]}>
         <Image
            alt="Recording Image"
            src={src}
            fill
            priority
            sizes="(max-width: 647px) 100vw, (max-width: 1279px) 50vw, 33vw"
            style={{
               objectFit: "cover",
               borderRadius: "8px",
            }}
         />
      </Box>
   )
}

const RecordingPlayer = ({
   onSecondPassed,
   onVideoEnded,
   videoUrl,
   playerRef,
   isVideoReady,
   setIsVideoReady,
   playingVideo,
   muted,
   preview,
}) => {
   const [progress, setProgress] = useState(0)

   const handleProgress = useCallback(
      (progress: OnProgressProps) => {
         setProgress(progress.played * 100)
         onSecondPassed?.(progress.playedSeconds)
      },
      [onSecondPassed]
   )

   const handleError: BaseReactPlayerProps["onError"] = useCallback(
      (error) => {
         errorLogAndNotify(error, {
            message: "Error playing video",
            videoUrl,
            error: JSON.stringify(error, null, 2),
         })
      },
      [videoUrl]
   )
   return (
      <>
         <ReactPlayer
            key={videoUrl}
            ref={playerRef}
            playing={Boolean(isVideoReady && playingVideo)}
            playsinline
            width="100%"
            height="100%"
            className="player"
            onReady={() => setIsVideoReady(true)}
            onProgress={handleProgress}
            onError={handleError}
            onEnded={onVideoEnded}
            progressInterval={1000}
            url={videoUrl}
            muted={muted}
            style={{
               borderRadius: "8px",
               border: "1px solid #EBEBEF",
               overflow: "hidden",
            }}
         />
         {!preview && (
            <LinearProgress
               sx={styles.progress}
               variant="determinate"
               value={progress}
            />
         )}
      </>
   )
}

export default RecordingCardPlayer
