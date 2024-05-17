import { LivestreamVideo } from "@careerfairy/shared-lib/livestreams"
import MuteIcon from "@mui/icons-material/VolumeOff"
import UnmuteIcon from "@mui/icons-material/VolumeUp"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { alpha } from "@mui/material/styles"
import { useUpdateLivestreamVideoState } from "components/custom-hook/streaming/video/useUpdateLivestreamVideoState"
import { Fragment, useCallback, useEffect, useRef, useState } from "react"
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
})

type Props = {
   userId: string
   livestreamId: string
   video: LivestreamVideo
}

export const SynchronizedVideo = ({ livestreamId, userId, video }: Props) => {
   const { trigger: updateVideoState } =
      useUpdateLivestreamVideoState(livestreamId)

   const isVideoSharer = video.updater === userId

   const isVideoSharerRef = useRef(isVideoSharer)
   isVideoSharerRef.current = isVideoSharer

   const [autoPlayFailed, setAutoPlayFailed] = useState(false)

   // If you have not interacted with the page before, you are muted
   const [muted, setMuted] = useState(false)
   // const [muted, setMuted] = useState(!navigator.userActivation.hasBeenActive)

   console.log("🚀 ~ ", {
      hasBeenActive: navigator.userActivation.hasBeenActive,
      isActive: navigator.userActivation.isActive,
      autoPlayFailed,
      muted,
   })

   const [reactPlayerInstance, setReactPlayerInstance] =
      useState<ReactPlayer | null>(null)

   const playerReady = Boolean(reactPlayerInstance)

   useEffect(() => {
      if (!playerReady) return

      if (video.state === "playing" && video.lastPlayed) {
         handleInitialize()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [playerReady])

   useEffect(() => {
      if (playerReady && !isVideoSharer) {
         reactPlayerInstance.seekTo(video.second, "seconds")
      }
   }, [video.second, playerReady, isVideoSharer, reactPlayerInstance])

   const handleInitialize = () => {
      const secondsDiff = getSecondsBetweenDates(
         video.lastPlayed.toDate(),
         new Date()
      )
      reactPlayerInstance?.seekTo(video.second + secondsDiff, "seconds")
   }

   const handlePlay = useCallback(async () => {
      if (!isVideoSharer || !playerReady) {
         return
      }

      return updateVideoState({
         state: "playing",
         second: reactPlayerInstance?.getCurrentTime() || 0,
         updater: userId,
      })
   }, [
      isVideoSharer,
      playerReady,
      updateVideoState,
      reactPlayerInstance,
      userId,
   ])

   const handlePause = useCallback(() => {
      if (!isVideoSharer) {
         return
      }
      updateVideoState({ state: "paused" })
   }, [isVideoSharer, updateVideoState])

   const handleError: YouTubePlayerProps["onError"] = useCallback((error) => {
      console.log("🚀 ~  ~ error:", error)
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
               onPlay={handlePlay}
               onPause={handlePause}
            />
         </Box>
      </Fragment>
   )
}

const getSecondsBetweenDates = (startDate: Date, endDate: Date) => {
   return (endDate.getTime() - startDate.getTime()) / 1000
}
