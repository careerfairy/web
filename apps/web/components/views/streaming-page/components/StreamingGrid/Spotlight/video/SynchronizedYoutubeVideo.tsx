import { LivestreamVideo } from "@careerfairy/shared-lib/livestreams"
import MuteIcon from "@mui/icons-material/VolumeOff"
import UnmuteIcon from "@mui/icons-material/VolumeUp"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { alpha } from "@mui/material/styles"
import { useSetLivestreamMode } from "components/custom-hook/streaming/useSetLivestreamMode"
import { Fragment, useCallback, useEffect, useState } from "react"
import ReactPlayer, { YouTubePlayerProps } from "react-player/youtube"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
      backgroundColor: "black",
      position: "relative",
      height: "calc(100% - 48px)",
      "& button": {
         backgroundColor: (theme) => alpha(theme.palette.common.black, 0.4),
         color: "white",
         "&:hover": {
            backgroundColor: (theme) => alpha(theme.palette.common.black, 0.8),
            opacity: 1,
            color: "white",
         },
      },
   },
   muteButton: {
      position: "absolute",
      bottom: 5,
      left: 5,
      zIndex: "9000",
      color: "white",
      borderColor: "white !important",
      // textShadow: (theme) => theme.darkTextShadow,
   },

   stopSharingButton: {
      top: 5,
      zIndex: "9000",
      right: 5,
      position: "absolute",
   },
})

type Props = {
   userId: string
   livestreamId: string
   isHost: boolean
   video: LivestreamVideo
}

export const SynchronizedVideo = ({ livestreamId, userId, video }: Props) => {
   console.log(
      "🚀 ~ file: SynchronizedYoutubeVideo.tsx:64 ~ SynchronizedVideo ~ navigator.userActivation.hasBeenActive:",
      navigator.userActivation.hasBeenActive
   )
   const { trigger: setLivestreamMode } = useSetLivestreamMode(livestreamId)
   console.log(
      "🚀 ~ file: SynchronizedYoutubeVideo.tsx:59 ~ SynchronizedVideo ~ setLivestreamMode:",
      setLivestreamMode
   )

   const isVideoSharer = video.updater === userId

   const [autoPlayFailed, setAutoPlayFailed] = useState(false)
   console.log(
      "🚀 ~ file: SynchronizedYoutubeVideo.tsx:64 ~ SynchronizedVideo ~ autoPlayFailed:",
      autoPlayFailed
   )

   // If you have not interacted with the page before, you are muted
   const [muted, setMuted] = useState(!navigator.userActivation.hasBeenActive)

   const [reactPlayerInstance, setReactPlayerInstance] =
      useState<ReactPlayer | null>(null)
   const [initialized, setInitialized] = useState(false)

   const handleSeek = (seconds: number) => {
      return reactPlayerInstance.seekTo(seconds, "seconds")
   }

   const isReady = Boolean(reactPlayerInstance)

   useEffect(() => {
      if (!isReady) return
      if (!initialized && video.state === "playing" && video.lastPlayed) {
         handleInitialize()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isReady])

   useEffect(() => {
      if (!initialized && video.state === "paused") {
         setInitialized(true)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [video.state])

   useEffect(() => {
      if (initialized && !isVideoSharer) {
         handleSeek(video.second)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [video.second])

   const handleInitialize = () => {
      const secondsDiff = getSecondsBetweenDates(
         video.lastPlayed.toDate(),
         new Date()
      )
      handleSeek(video.second + secondsDiff)
   }

   // const updateYoutubeVideoState = (state) => {
   //    return updateCurrentVideoState(streamRef, state)
   // }

   // const handlePlay = useCallback(async () => {
   //    if (!initialized) {
   //       setInitialized(true)
   //    }
   //    if (!isVideoSharer || !initialized) {
   //       return
   //    }

   //    return updateYoutubeVideoState({
   //       state: "playing",
   //       second: reactPlayerInstance?.getCurrentTime() || 0,
   //       updater: streamerId,
   //    })
   // }, [reactPlayerInstance, initialized, streamerId])

   // const handlePause = useCallback(() => {
   //    if (!isVideoSharer) {
   //       return
   //    }
   //    updateYoutubeVideoState({ state: "paused" })
   // }, [isVideoSharer, streamRef])

   const handleError: YouTubePlayerProps["onError"] = useCallback((error) => {
      console.error(error)
      setAutoPlayFailed(true)
   }, [])

   const handleOnReady = useCallback((player) => {
      setReactPlayerInstance(player)
   }, [])

   return (
      <Fragment>
         <Box sx={styles.root}>
            {Boolean(!isVideoSharer && reactPlayerInstance) && (
               <Button
                  sx={styles.muteButton}
                  color={"grey"}
                  startIcon={muted ? <MuteIcon /> : <UnmuteIcon />}
                  onClick={() => setMuted((prev) => !prev)}
               >
                  {muted ? "Unmute" : "Mute"}
               </Button>
            )}

            <ReactPlayer
               playing={video.state === "playing"}
               style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  transform: "translateY(-50%)",
                  pointerEvents: isVideoSharer ? "visibleFill" : "none",
               }}
               config={{
                  // https://developers.google.com/youtube/player_parameters
                  playerVars: {
                     controls: isVideoSharer ? 1 : 0,
                     fs: 0,
                     disablekb: isVideoSharer ? 0 : 1,
                     rel: 0,
                  },
               }}
               muted={muted}
               controls={isVideoSharer}
               url={video.url}
               onError={handleError}
               width="100%"
               height={"100%"}
               onReady={handleOnReady}
               // onPlay={handlePlay}
               // onPause={handlePause}
            />
         </Box>
      </Fragment>
   )
}

const getSecondsBetweenDates = (startDate: Date, endDate: Date) => {
   return (endDate.getTime() - startDate.getTime()) / 1000
}
