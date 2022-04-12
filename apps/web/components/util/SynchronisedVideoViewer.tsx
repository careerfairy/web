import { Fragment, useCallback, useEffect, useState } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import ReactPlayer from "react-player/youtube"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "../../store/actions"
import useStreamRef from "../custom-hook/useStreamRef"
import AreYouSureModal from "../../materialUI/GlobalModals/AreYouSureModal"

const styles = {
   root: {
      width: "100%",
      backgroundColor: "black",
      position: "relative",
      height: "calc(100% - 48px)",
   },
   muteButton: {
      position: "absolute",
      top: 5,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "9000",
   },
   stopSharingButton: {
      top: 5,
      position: "absolute",
      zIndex: "9000",
      right: 5,
      opacity: 0.5,
      "&:hover": {
         opacity: 1,
      },
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
   const [loading, setLoading] = useState(false)
   const [muted, setMuted] = useState(viewer)
   const [initialized, setInitialized] = useState(false)
   const [videoData, setVideoData] = useState(null)
   const isVideoSharer = videoData && streamerId === videoData?.updater
   const dispatch = useDispatch()

   const getTimeBetweenDates = (startDate, endDate) => {
      return (endDate.getTime() - startDate.getTime()) / 1000
   }

   const handleSeek = (seconds: number) => {
      return reactPlayerInstance.seekTo(seconds, "seconds")
   }
   const handleOpenConfirmRemoveVideoModal = () =>
      setRemoveYoutubeVideoModalOpen(true)
   const handleCloseConfirmRemoveVideoModal = () =>
      setRemoveYoutubeVideoModalOpen(false)

   useEffect(() => {
      if (viewer) {
         dispatch(actions.setVideoIsPaused())
      }
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
   }, [Boolean(videoData), Boolean(reactPlayerInstance)])

   useEffect(() => {
      if (!initialized && videoData?.state === "paused") {
         setInitialized(true)
      }
   }, [videoData?.state])

   useEffect(() => {
      if (initialized && !isVideoSharer) {
         handleSeek(videoData.second)
      }
   }, [videoData?.second])

   const handleInitialize = () => {
      const secondsDiff = getTimeBetweenDates(
         videoData.lastPlayed.toDate(),
         new Date()
      )
      handleSeek(videoData.second + secondsDiff)
   }

   useEffect(() => {
      if (livestreamId) {
         setLoading(true)
         const unsubscribe = listenToCurrentVideo(
            streamRef,
            (querySnapshot) => {
               if (querySnapshot.exists) {
                  setVideoData(querySnapshot.data())
               }
               setLoading(false)
            }
         )
         return () => unsubscribe()
      }
   }, [livestreamId])

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
   }, [reactPlayerInstance, initialized, streamerId])

   const handlePause = useCallback(() => {
      if (!isVideoSharer) {
         return
      }
      updateYoutubeVideoState({ state: "paused" })
   }, [isVideoSharer, streamRef])

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
   }, [])

   return (
      <Fragment>
         <Box sx={styles.root}>
            {!isVideoSharer && reactPlayerInstance && videoData && (
               <Button
                  sx={styles.muteButton}
                  onClick={() => setMuted((prev) => !prev)}
               >
                  {muted ? "Unmute" : "Mute"}
               </Button>
            )}
            {(isVideoSharer || !viewer) && videoData && (
               <Button
                  variant={"contained"}
                  color={"secondary"}
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
               config={{
                  playerVars: {
                     controls: isVideoSharer ? 1 : 0,
                     fs: 0,
                     disablekb: isVideoSharer ? 0 : 1,
                  },
               }}
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
         {removeYoutubeVideoModalOpen && (
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
