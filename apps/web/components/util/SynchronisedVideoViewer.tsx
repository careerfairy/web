import CloseIcon from "@mui/icons-material/Close"
import MuteIcon from "@mui/icons-material/VolumeOff"
import UnmuteIcon from "@mui/icons-material/VolumeUp"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { alpha } from "@mui/material/styles"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { Fragment, useCallback, useEffect, useState } from "react"
import ReactPlayer from "react-player"
import { useDispatch, useSelector } from "react-redux"
import DateUtil from "util/DateUtil"
import AreYouSureModal from "../../materialUI/GlobalModals/AreYouSureModal"
import * as actions from "../../store/actions"
import useStreamRef from "../custom-hook/useStreamRef"
import { getConfig } from "./reactPlayer"

const styles = {
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
      textShadow: (theme) => theme.darkTextShadow,
   },

   stopSharingButton: {
      top: 5,
      zIndex: "9000",
      right: 5,
      position: "absolute",
   },
}
const SynchronisedVideoViewer = ({ livestreamId, streamerId, viewer }) => {
   const { unpauseFailedPlayRemoteVideos } = useSelector(
      // @ts-ignore
      (state) => state.stream.streaming
   )
   const streamRef = useStreamRef()
   const {
      listenToCurrentVideo,
      updateCurrentVideoState,
      stopSharingYoutubeVideo,
   } = useFirebaseService()
   const [removingVideo, setRemovingVideo] = useState(false)
   const [reactPlayerInstance, setReactPlayerInstance] = useState(null)
   const [removeYoutubeVideoModalOpen, setRemoveYoutubeVideoModalOpen] =
      useState(false)
   const [muted, setMuted] = useState(viewer)
   const [initialized, setInitialized] = useState(false)
   const [videoData, setVideoData] = useState(null)
   const isVideoSharer = videoData && streamerId === videoData?.updater
   const dispatch = useDispatch()

   const handleSeek = (seconds: number) => {
      return reactPlayerInstance.seekTo(seconds, "seconds")
   }
   const handleOpenConfirmRemoveVideoModal = () =>
      setRemoveYoutubeVideoModalOpen(true)
   const handleCloseConfirmRemoveVideoModal = () =>
      setRemoveYoutubeVideoModalOpen(false)

   useEffect(() => {
      if (viewer && !unpauseFailedPlayRemoteVideos) {
         dispatch(actions.setVideoIsPaused())
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch])

   useEffect(() => {
      if (unpauseFailedPlayRemoteVideos) {
         setMuted(false)
      }
   }, [unpauseFailedPlayRemoteVideos])

   useEffect(() => {
      if (!videoData || !reactPlayerInstance) return
      if (
         !initialized &&
         videoData.state === "playing" &&
         videoData.lastPlayed
      ) {
         handleInitialize()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [Boolean(videoData), Boolean(reactPlayerInstance)])

   useEffect(() => {
      if (!initialized && videoData?.state === "paused") {
         setInitialized(true)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [videoData?.state])

   useEffect(() => {
      if (initialized && !isVideoSharer) {
         handleSeek(videoData.second)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [videoData?.second])

   const handleInitialize = () => {
      const secondsDiff = DateUtil.getSecondsBetweenDates(
         videoData.lastPlayed.toDate(),
         new Date()
      )
      handleSeek(videoData.second + secondsDiff)
   }

   useEffect(() => {
      if (livestreamId) {
         const unsubscribe = listenToCurrentVideo(
            streamRef,
            (querySnapshot) => {
               if (querySnapshot.exists) {
                  setVideoData(querySnapshot.data())
               }
            }
         )
         return () => unsubscribe()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [livestreamId])

   // eslint-disable-next-line react-hooks/exhaustive-deps
   const updateYoutubeVideoState = (state) => {
      return updateCurrentVideoState(streamRef, state)
   }

   const handlePlay = useCallback(async () => {
      if (!initialized) {
         setInitialized(true)
      }
      if (!isVideoSharer || !initialized) {
         return
      }

      return updateYoutubeVideoState({
         state: "playing",
         second: reactPlayerInstance?.getCurrentTime() || 0,
         updater: streamerId,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [reactPlayerInstance, initialized, streamerId])

   const handlePause = useCallback(() => {
      if (!isVideoSharer) {
         return
      }
      updateYoutubeVideoState({ state: "paused" })
   }, [isVideoSharer, updateYoutubeVideoState])

   const handleError = useCallback((error) => {
      console.error(error)
   }, [])

   const handleOnReady = useCallback((player) => {
      setReactPlayerInstance(player)
   }, [])

   const handleStopSharingVideo = useCallback(async () => {
      try {
         setRemovingVideo(true)
         await stopSharingYoutubeVideo(streamRef)
         setRemovingVideo(false)
      } catch (e) {
         console.error(e)
      }
   }, [stopSharingYoutubeVideo, streamRef])

   return (
      <Fragment>
         <Box sx={styles.root}>
            {Boolean(!isVideoSharer && reactPlayerInstance && videoData) && (
               <Button
                  sx={styles.muteButton}
                  color={"grey"}
                  startIcon={muted ? <MuteIcon /> : <UnmuteIcon />}
                  onClick={() => setMuted((prev) => !prev)}
               >
                  {muted ? "Unmute" : "Mute"}
               </Button>
            )}
            {Boolean((isVideoSharer || !viewer) && videoData) && (
               <Button
                  color={"grey"}
                  size={"large"}
                  startIcon={<CloseIcon />}
                  onClick={handleOpenConfirmRemoveVideoModal}
                  sx={styles.stopSharingButton}
               >
                  Stop Sharing
               </Button>
            )}
            <ReactPlayer
               playing={videoData?.state === "playing"}
               style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  transform: "translateY(-50%)",
                  pointerEvents: isVideoSharer ? "visibleFill" : "none",
               }}
               config={getConfig(isVideoSharer)}
               muted={muted}
               controls={isVideoSharer}
               url={videoData?.url}
               onError={handleError}
               width="100%"
               height={"100%"}
               onReady={handleOnReady}
               onPlay={handlePlay}
               onPause={handlePause}
            />
         </Box>
         {Boolean(removeYoutubeVideoModalOpen) && (
            <AreYouSureModal
               title="Are you sure you want to stop sharing the video?"
               handleConfirm={handleStopSharingVideo}
               open={removeYoutubeVideoModalOpen}
               handleClose={handleCloseConfirmRemoveVideoModal}
               loading={removingVideo}
               confirmButtonText={"Stop Sharing"}
            />
         )}
      </Fragment>
   )
}

export default SynchronisedVideoViewer
