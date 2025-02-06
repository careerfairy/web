import { LivestreamVideo } from "@careerfairy/shared-lib/livestreams"
import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { alpha } from "@mui/material/styles"
import { useUpdateLivestreamVideoState } from "components/custom-hook/streaming/video/useUpdateLivestreamVideoState"
import { getConfig } from "components/util/reactPlayer"
import { Fragment, useEffect, useRef, useState } from "react"
import { Play } from "react-feather"
import ReactPlayer, { ReactPlayerProps } from "react-player"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import DateUtil from "util/DateUtil"
import { useSpotlight } from "../SpotlightProvider"

const styles = sxStyles({
   root: (theme) => ({
      width: "100%",
      height: "100%",
      backgroundColor: "black",
      position: "relative",
      "& button": {
         backgroundColor: alpha(theme.palette.common.black, 0.4),
         color: "white",
         "&:hover": {
            backgroundColor: alpha(theme.palette.common.black, 0.8),
            opacity: 1,
            color: "white",
         },
      },
   }),
   muteButton: {
      position: "absolute",
      bottom: 5,
      left: 5,
   },
   backdrop: (theme) => ({
      color: theme.palette.common.white,
      zIndex: theme.zIndex.appBar + 1,
      position: "absolute",
   }),
})

type Props = {
   userId: string
   livestreamId: string
   video: LivestreamVideo
}

export const SynchronizedVideo = ({ livestreamId, userId, video }: Props) => {
   const { trigger: updateVideoState } =
      useUpdateLivestreamVideoState(livestreamId)
   const { isMuted, setIsMuted, setShowMute } = useSpotlight()

   const isVideoSharer = video.updater === userId

   const isVideoSharerRef = useRef(isVideoSharer)
   isVideoSharerRef.current = isVideoSharer

   const [autoPlayFailed, setAutoPlayFailed] = useState(
      !navigator?.userActivation?.hasBeenActive
   )

   const muted = autoPlayFailed ? true : isMuted

   const [reactPlayerInstance, setReactPlayerInstance] =
      useState<ReactPlayer | null>(null)

   const playerReady = Boolean(reactPlayerInstance)

   const videoRef = useRef(video)
   videoRef.current = video

   /**
    * Initializes the video player for all users, including the video sharer.
    * Ensures continuous playback from the last known point if the sharer exits.
    */
   useEffect(() => {
      if (!reactPlayerInstance) return

      if (videoRef.current.state === "playing" && videoRef.current.lastPlayed) {
         const secondsDiff = DateUtil.getSecondsBetweenDates(
            videoRef.current.lastPlayed.toDate(),
            new Date()
         )
         reactPlayerInstance.seekTo(
            videoRef.current.second + secondsDiff,
            "seconds"
         )
      }
   }, [reactPlayerInstance])

   /**
    * Initializes the mute overlay control
    */
   useEffect(() => {
      setShowMute(Boolean(!isVideoSharer && reactPlayerInstance))
   }, [isVideoSharer, reactPlayerInstance, setShowMute])

   const videoPaused = video.state === "paused"

   /**
    * Effect to handle syncing everybody else's video
    * player to the video sharer's video player
    */
   useEffect(() => {
      if (videoPaused || isVideoSharer) return

      if (reactPlayerInstance) {
         const secondsDiff = DateUtil.getSecondsBetweenDates(
            videoRef.current.lastPlayed.toDate(),
            new Date()
         )
         reactPlayerInstance.seekTo(video.second + secondsDiff, "seconds")
      }
   }, [video.second, isVideoSharer, reactPlayerInstance, videoPaused])

   const handlePlay = () => {
      if (!isVideoSharer || !playerReady) {
         return
      }

      return updateVideoState({
         state: "playing",
         second: reactPlayerInstance?.getCurrentTime() || 0,
         updater: userId,
      })
   }

   const handlePause = () => {
      if (isVideoSharer) {
         updateVideoState({ state: "paused" })
      }
   }

   const handleError: ReactPlayerProps["onError"] = (error) => {
      errorLogAndNotify(error, "Error playing video")
      setAutoPlayFailed(true)
   }

   const handleOnReady: ReactPlayerProps["onReady"] = (player) => {
      setReactPlayerInstance(player)
   }

   const handleClickToEnableAudio = () => {
      setAutoPlayFailed(false)
      setIsMuted(false)
   }

   return (
      <Fragment>
         <Box sx={styles.root}>
            <ReactPlayer
               playing={video.state === "playing"}
               config={getConfig(isVideoSharer)}
               muted={muted}
               controls={isVideoSharer}
               url={video.url}
               onError={handleError}
               onReady={handleOnReady}
               onPlay={handlePlay}
               onPause={handlePause}
               width="100%"
               height="100%"
               style={{
                  pointerEvents: isVideoSharer ? "visibleFill" : "none",
               }}
            />
            {Boolean(autoPlayFailed) && (
               <Backdrop
                  sx={styles.backdrop}
                  open={autoPlayFailed}
                  onClick={handleClickToEnableAudio}
               >
                  <Button size="large" startIcon={<Play />}>
                     Click for audio
                  </Button>
               </Backdrop>
            )}
         </Box>
      </Fragment>
   )
}
