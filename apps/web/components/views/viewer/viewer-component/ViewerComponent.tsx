import React, {
   Fragment,
   memo,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import useDevices from "../../../../components/custom-hook/useDevices"
import useMediaSources from "../../../../components/custom-hook/useMediaSources"
import VideoControlsContainer from "../../../../components/views/streaming/video-container/VideoControlsContainer"
import { useAuth } from "../../../../HOCs/AuthProvider"
import makeStyles from "@mui/styles/makeStyles"
import SettingsModal from "../../streaming/video-container/SettingsModal"
import { Typography } from "@mui/material"
import ScreenShareModal from "../../streaming/video-container/ScreenShareModal"
import EmoteButtons from "../EmoteButtons"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import * as actions from "../../../../store/actions"
import useCurrentSpeaker from "../../../custom-hook/useCurrentSpeaker"
import Streams from "../../streaming/video-container/Streams"
import DraggableComponent from "../../banners/DraggableComponent"
import WifiIndicator from "../../streaming/video-container/WifiIndicator"
import StreamPublishingModal from "../../../../components/views/streaming/modal/StreamPublishingModal"
import StreamStoppedOverlay from "./overlay/StreamStoppedOverlay"
import useHandRaiseState from "../../../../components/custom-hook/useHandRaiseState"
import RTMContext from "../../../../context/agora/RTMContext"
import AgoraStateHandler from "../../streaming/modal/AgoraStateModal/AgoraStateHandler"
import { focusModeEnabledSelector } from "../../../../store/selectors/streamSelectors"
import { useRtc } from "../../../../context/agora/RTCProvider"
import { RootState } from "../../../../store"
import { useCurrentStream } from "../../../../context/stream/StreamContext"
import { HandRaiseState } from "../../../../types/handraise"
import { errorLogAndNotify } from "../../../../util/CommonUtil"
import EndOfStreamView from "./EndOfStreamView"
import { usePreFetchRecommendedEvents } from "../../../custom-hook/useRecommendedEvents"

const useStyles = makeStyles((theme) => ({
   waitingOverlay: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor:
         theme.palette.mode === "dark"
            ? theme.palette.common.black
            : theme.palette.background.paper,
      zIndex: 999,
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
   },
   waitingText: {
      fontSize: "1.1em",
      fontWeight: "700",
      color: theme.palette.primary.main,
      textAlign: "center",
      padding: theme.spacing(0, 3),
   },
}))

interface Props {
   handRaiseActive: boolean
   showMenu: boolean
}

const ViewerComponent = ({ handRaiseActive, showMenu }: Props) => {
   const {
      currentLivestream,
      streamerId,
      isMobile: mobile,
      isBreakout,
      presenter,
   } = useCurrentStream()
   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const spyModeEnabled = useSelector(
      (state: RootState) => state.stream.streaming.spyModeEnabled
   )
   const classes = useStyles()
   const dispatch = useDispatch()
   const [showSettings, setShowSettings] = useState(false)
   const [showScreenShareModal, setShowScreenShareModal] = useState(false)
   const [showLocalStreamPublishingModal, setShowLocalStreamPublishingModal] =
      useState(null)
   const [handRaiseState, updateRequest, hasRoom, prevHandRaiseState] =
      useHandRaiseState()

   const {
      query: { livestreamId, isRecordingWindow },
   } = useRouter()

   const { userData } = useAuth()
   const hasActiveRooms = useSelector((state: RootState) =>
      Boolean(
         state.firestore.ordered?.[`Active BreakoutRooms of ${livestreamId}`]
            ?.length
      )
   )

   const {
      networkQuality,
      localStream,
      localMediaControls,
      remoteStreams,
      localMediaHandlers,
      publishLocalStreamTracks,
      handlePublishLocalStream,
      unPublishScreenShareStream,
      handleScreenShare,
      setDesktopMode,
   } = useRtc()

   const { createEmote } = useContext(RTMContext)

   const deviceSettings = useMemo(
      () => ({
         initialize: Boolean(handRaiseActive),
      }),
      [handRaiseActive]
   )
   const { devices, deviceInitializers } = useDevices(
      localStream,
      deviceSettings
   )

   const { mediaControls, localMediaStream: displayableMediaStream } =
      useMediaSources(devices, localStream, true)

   const currentSpeakerId = useCurrentSpeaker(localStream, remoteStreams)

   useEffect(() => {
      setShowLocalStreamPublishingModal(Boolean(handRaiseActive))
   }, [handRaiseActive])

   useEffect(() => {
      if (!isBreakout && !remoteStreams?.length && hasActiveRooms) {
         const timout = setTimeout(function () {
            //Start the timer
            dispatch(actions.openViewerBreakoutModal())
         }, 3000) // Only open modal If no streams appear after 3 seconds

         return () => clearTimeout(timout) // Cancel opening modal if streams appear before 3 seconds
      }
   }, [Boolean(remoteStreams?.length), isBreakout, hasActiveRooms])

   useEffect(() => {
      if (
         handRaiseActive &&
         prevHandRaiseState.current?.state === HandRaiseState.invited &&
         // Make sure not to auto invite if the viewer is still in the publishing modal
         showLocalStreamPublishingModal === false
      ) {
         void handleJoinAsHandRaiser()
      }
   }, [
      prevHandRaiseState.current?.state === HandRaiseState.invited,
      showLocalStreamPublishingModal,
   ])

   useEffect(() => {
      if (
         !handRaiseActive ||
         (handRaiseState &&
            (handRaiseState.state === HandRaiseState.unrequested ||
               handRaiseState.state === HandRaiseState.denied))
      ) {
         void handleLeaveAsHandRaiser()
      }
   }, [handRaiseActive, handRaiseState])

   // prefetch recommended events
   usePreFetchRecommendedEvents()

   const handleCloseScreenShareModal = useCallback(() => {
      setShowScreenShareModal(false)
   }, [])

   const handleClickScreenShareButton = async () => {
      if (currentLivestream.mode === "desktop") {
         unPublishScreenShareStream()
            .then(async () => {
               return await setDesktopMode("default", streamerId)
            })
            .catch((err) =>
               errorLogAndNotify(err, {
                  message: "Failed on click screen share",
               })
            )
      } else {
         setShowScreenShareModal(true)
      }
   }

   const requestHandRaise = async () => {
      try {
         switch (handRaiseState?.state) {
            case HandRaiseState.connected:
               // If you were previously connected
               if (hasRoom) {
                  // and there is still room
                  await updateRequest(HandRaiseState.connecting)
               } else {
                  await updateRequest(HandRaiseState.requested)
               }
               break
            case HandRaiseState.connecting:
               // After being in a connecting state for god knows how long, you finally clicked join.
               if (hasRoom) {
                  // At the time of clicking join there is still room, so you can join in the stream as a HR
                  await handleJoinAsHandRaiser()
               } else {
                  //  At the time of clicking join there is no more room, which means you
                  //  have to go back into the queue as an HR
                  await updateRequest(HandRaiseState.requested)
                  dispatch(actions.enqueueSuccessfulHandRaiseRequest())
               }
               break
            case HandRaiseState.invited:
               // If you are currently invited
               if (hasRoom) {
                  // and there is still room
                  await handleJoinAsHandRaiser()
               } else {
                  // If there is no room go back into queue
                  await updateRequest(HandRaiseState.requested)
                  dispatch(actions.enqueueSuccessfulHandRaiseRequest())
               }
               break
            default:
               await updateRequest(HandRaiseState.requested)
               dispatch(actions.enqueueSuccessfulHandRaiseRequest())
               break
         }
      } catch (e) {
         console.log("-> e", e)
      }
      setShowLocalStreamPublishingModal(false)
   }

   const handleJoinAsHandRaiser = async () => {
      await handlePublishLocalStream()
      await updateRequest(HandRaiseState.connected)
      dispatch(actions.closeSuccessfulHandRaiseRequest())
   }

   const handleLeaveAsHandRaiser = async () => {
      if (localStream.audioTrack && localStream.isAudioPublished) {
         await localMediaHandlers.closeLocalMicrophoneTrack()
      }
      if (localStream.videoTrack && localStream.isVideoPublished) {
         await localMediaHandlers.closeLocalCameraTrack()
      }
      await publishLocalStreamTracks.returnToAudience()
      await dispatch(actions.setStreamerIsPublished(false))
   }

   const handleJoinAsViewer = async () => {
      await localMediaHandlers.closeLocalCameraTrack()
      await localMediaHandlers.closeLocalMicrophoneTrack()
      await dispatch(actions.setStreamerIsPublished(false))
      await updateRequest(HandRaiseState.unrequested)
      setShowLocalStreamPublishingModal(false)
   }

   const openPublishModal = useCallback(
      () => setShowLocalStreamPublishingModal(true),
      []
   )

   const localStreamIsPublished = useMemo(() => {
      return {
         audio: localStream?.isAudioPublished,
         video: localStream?.isVideoPublished,
      }
   }, [localStream?.isAudioPublished, localStream?.isVideoPublished])

   const closeSettings = useCallback(() => setShowSettings(false), [])

   if (!currentLivestream) {
      return null
   }

   if (
      presenter?.streamHasFinished() &&
      !isRecordingWindow &&
      userData &&
      !spyModeEnabled
   ) {
      return <EndOfStreamView />
   }

   return (
      <React.Fragment>
         {!Boolean(mobile && handRaiseActive) && !focusModeEnabled && (
            <EmoteButtons createEmote={createEmote} />
         )}
         <Streams
            externalMediaStreams={remoteStreams}
            localMediaStream={localStream}
            currentSpeakerId={currentSpeakerId as string}
            streamerId={streamerId}
            mobile={mobile}
            handRaiseActive={currentLivestream.handRaiseActive}
            videoMutedBackgroundImg={currentLivestream.companyLogoUrl}
            liveSpeakers={currentLivestream.liveSpeakers}
            isBroadCasting={handRaiseActive}
            sharingScreen={currentLivestream.mode === "desktop"}
            sharingPdf={currentLivestream.mode === "presentation"}
            sharingVideo={
               currentLivestream.mode === "video" &&
               (currentLivestream.hasStarted || spyModeEnabled)
            }
            showMenu={showMenu}
            livestreamId={currentLivestream.id}
            viewer
         />
         <AgoraStateHandler />
         {Boolean(showLocalStreamPublishingModal) && (
            <StreamPublishingModal
               showSoundMeter={Boolean(
                  (showLocalStreamPublishingModal || showSettings) &&
                     localStream?.audioTrack
               )}
               localStream={localStream}
               displayableMediaStream={displayableMediaStream}
               devices={devices}
               deviceInitializers={deviceInitializers}
               mediaControls={mediaControls}
               onConfirmStream={requestHandRaise}
               onRefuseStream={handleJoinAsViewer}
               localMediaHandlers={localMediaHandlers}
               labels={{
                  mainTitle: "Activate Your Devices To Join The Stream",
                  refuseTooltip: "Cancel Hand Raise",
                  refuseLabel: "Cancel",
                  joinWithoutCameraLabel: "Join without camera",
                  joinWithoutCameraTooltip:
                     "We recommend to activate your camera for a better experience.",
                  joinButtonLabel: ["connecting", "connected"].includes(
                     handRaiseState?.state
                  )
                     ? "Enter now"
                     : "Confirm Hand Raise",
                  disabledJoinButtonLabel: "Activate Microphone to Join",
                  joinWithoutCameraConfirmDescription:
                     "You intend to join this stream with only with your microphone?",
               }}
            />
         )}
         {handRaiseActive && (
            <Fragment>
               <DraggableComponent
                  zIndex={3}
                  bounds="parent"
                  positionStyle={"absolute"}
                  defaultPosition={defaultPosition}
                  elementId="wifiIndicatorLocation"
               >
                  <WifiIndicator
                     uplink={networkQuality.uplinkNetworkQuality}
                     downlink={networkQuality.downlinkNetworkQuality}
                  />
               </DraggableComponent>
               <VideoControlsContainer
                  currentLivestream={currentLivestream}
                  handleClickScreenShareButton={handleClickScreenShareButton}
                  streamerId={streamerId}
                  isMainStreamer={false}
                  localStreamIsPublished={localStreamIsPublished}
                  microphoneMuted={Boolean(localStream.audioTrack?.muted)}
                  cameraInactive={!Boolean(localStream.videoTrack?.enabled)}
                  openPublishingModal={openPublishModal}
                  viewer={true}
                  localMediaControls={localMediaControls}
                  showSettings={showSettings}
                  setShowSettings={setShowSettings}
               />

               {showSettings && (
                  <SettingsModal
                     close={closeSettings}
                     devices={devices}
                     deviceInitializers={deviceInitializers}
                     localStream={localStream}
                     displayableMediaStream={displayableMediaStream}
                     mediaControls={mediaControls}
                     localMediaHandlers={localMediaHandlers}
                     smallScreen={false}
                  />
               )}

               {showScreenShareModal && (
                  <ScreenShareModal
                     open={showScreenShareModal}
                     handleClose={handleCloseScreenShareModal}
                     handleScreenShare={handleScreenShare}
                     smallScreen={false}
                  />
               )}
            </Fragment>
         )}

         {!currentLivestream.hasStarted &&
            !spyModeEnabled &&
            (currentLivestream.test ? (
               <div className={classes.waitingOverlay}>
                  <Typography className={classes.waitingText}>
                     The streamer has to press Start Streaming to be visible to
                     students
                  </Typography>
               </div>
            ) : (
               <StreamStoppedOverlay />
            ))}
      </React.Fragment>
   )
}

const defaultPosition = { x: 4, y: 70 }

export default memo(ViewerComponent)
