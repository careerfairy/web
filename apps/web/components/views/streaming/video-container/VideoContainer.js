import React, {
   useCallback,
   useContext,
   useEffect,
   useState,
   useMemo,
} from "react"

import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import VideoControlsContainer from "./VideoControlsContainer"
import useDevices from "components/custom-hook/useDevices"
import TutorialContext from "context/tutorials/TutorialContext"
import DemoIntroModal from "../modal/DemoIntroModal"
import DemoEndModal from "../modal/DemoEndModal"
import { useLocalStorage } from "react-use"

import useMediaSources from "components/custom-hook/useMediaSources"
import WifiIndicator from "./WifiIndicator"
import SettingsModal from "./SettingsModal"
import ScreenShareModal from "./ScreenShareModal"
import useStreamRef from "../../../custom-hook/useStreamRef"
import BreakoutRoomManagementModal from "../../../../layouts/StreamerLayout/StreamerTopBar/BreakoutRoomManagementModal"
import useCurrentSpeaker from "../../../custom-hook/useCurrentSpeaker"
import Streams from "./Streams"
import DraggableComponent from "../../banners/DraggableComponent"
import useAgoraRtc from "components/custom-hook/useAgoraRtc"
import StreamPublishingModal from "../modal/StreamPublishingModal"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import AgoraStateHandler from "../modal/AgoraStateModal/AgoraStateHandler"
import { useRouter } from "next/router"

const labels = {
   mainTitle: "Join the Stream",
   refuseTooltip:
      "Join without camera nor microphone. You will still be able to watch the streamers, give written answers to questions, share your screen and control slides.",
   refuseLabel: "I am only watching",
   joinWithoutCameraLabel: "Join without camera",
   joinWithoutCameraTooltip:
      "We recommend to activate your camera for a better experience.",
   joinButtonLabel: "Join as streamer",
   disabledJoinButtonLabel: "Activate microphone to join",
   joinWithoutCameraConfirmDescription:
      "You intend to join this stream with only with your microphone?",
}

function VideoContainer({
   currentLivestream,
   isPlayMode,
   showMenu,
   smallScreen,
   streamerId,
   viewer,
}) {
   const firebase = useFirebaseService()
   const {
      tutorialSteps,
      setTutorialSteps,
      setShowBubbles,
      handleConfirmStep,
      getActiveTutorialStepKey,
      endTutorial,
   } = useContext(TutorialContext)
   const isMainStreamer = streamerId === currentLivestream.id
   const streamRef = useStreamRef()
   const dispatch = useDispatch()
   const [hasDismissedStreamTutorial] = useLocalStorage(
      "hasDismissedStreamTutorial",
      false
   )
   const [showDemoIntroModal, setShowDemoIntroModal] = useState(false)
   const [hasProposedDemo, setHasProposedDemo] = useState(false)

   const {
      query: { withHighQuality },
   } = useRouter()
   const [showScreenShareModal, setShowScreenShareModal] = useState(false)
   const [showLocalStreamPublishingModal, setShowLocalStreamPublishingModal] =
      useState(true)
   const [optimizationMode] = useState("detail")

   const [showSettings, setShowSettings] = useState(false)

   const isStreamer = true
   const {
      networkQuality,
      localStream,
      localMediaControls,
      remoteStreams,
      screenShareStreamRef,
      publishScreenShareStream,
      unPublishScreenShareStream,
      leaveAgoraRoom,
      localMediaHandlers,
      handlePublishLocalStream,
      closeAndUnpublishedLocalStream,
      demoStreamHandlers,
   } = useAgoraRtc(streamerId, currentLivestream.id, isStreamer, true)

   const deviceSettings = useMemo(
      () => ({
         initialize: true,
      }),
      []
   )
   const { devices, deviceInitializers } = useDevices(
      localStream,
      deviceSettings
   )

   const { mediaControls, localMediaStream: displayableMediaStream } =
      useMediaSources(devices, localStream, true)

   const currentSpeakerId = useCurrentSpeaker(localStream, remoteStreams)

   useEffect(() => {
      if (streamerId && currentLivestream.id) {
         if (
            currentLivestream.mode === "desktop" &&
            currentLivestream.screenSharerId === streamerId
         ) {
            void setDesktopMode("default", streamerId)
         }
      }
   }, [streamerId, currentLivestream.id])

   useEffect(() => {
      if (
         ["presentation", "video"].includes(currentLivestream.mode) &&
         screenShareStreamRef?.current
      ) {
         void unPublishScreenShareStream()
      }
   }, [currentLivestream.mode, screenShareStreamRef])

   useEffect(() => {
      if (
         localStream &&
         remoteStreams &&
         !withHighQuality &&
         localStream.videoTrack
      ) {
         const manyStreams = remoteStreams.length > 3
         if (manyStreams) {
            const IAmCurrentlySpeakingAndBig =
               streamerId === currentSpeakerId &&
               currentLivestream.mode !== "desktop" &&
               currentLivestream.mode !== "presentation" &&
               currentLivestream.mode !== "video"
            if (IAmCurrentlySpeakingAndBig) {
               const makeStreamerHigherQualityTimeout = setTimeout(() => {
                  void setVideoQuality("480p_9")
               }, 20000)

               return () => clearTimeout(makeStreamerHigherQualityTimeout)
            } else {
               const makeStreamerLowerQualityTimeout = setTimeout(() => {
                  void setVideoQuality("180p")
               }, 15000)

               return () => clearTimeout(makeStreamerLowerQualityTimeout)
            }
         } else {
            // if not manyStreams then make the streams high quality
            void setVideoQuality("480p_9")
         }
      }
   }, [localStream, remoteStreams, currentSpeakerId, currentLivestream.mode])

   const setVideoQuality = async (quality) => {
      try {
         if (localStream.isVideoPublished) {
            await localStream.videoTrack.setEncoderConfiguration(quality)
         }
      } catch (e) {
         console.log("-> e in set video quality", e)
         dispatch(actions.setAgoraRtcError(e))
      }
   }

   const setDesktopMode = useCallback(
      async (mode, initiatorId) => {
         let screenSharerId =
            mode === "desktop" ? initiatorId : currentLivestream.screenSharerId
         await firebase.setDesktopMode(streamRef, mode, screenSharerId)
      },
      [currentLivestream?.screenSharerId, firebase, streamRef]
   )

   const handleOpenDemoIntroModal = useCallback(() => {
      const activeStep = getActiveTutorialStepKey()
      if (activeStep === 0 && !hasDismissedStreamTutorial && !hasProposedDemo) {
         setShowDemoIntroModal(true)
         setHasProposedDemo(true)
      }
   }, [hasDismissedStreamTutorial, hasProposedDemo, getActiveTutorialStepKey])

   const handlePublish = useCallback(async () => {
      try {
         await handlePublishLocalStream()
         setShowLocalStreamPublishingModal(false)
         if (currentLivestream.test) {
            handleOpenDemoIntroModal()
         }
      } catch (e) {
         console.log("-> error in HANDLE PUBLISH", e)
      }
   }, [
      handlePublishLocalStream,
      currentLivestream?.test,
      handleOpenDemoIntroModal,
   ])

   const handleJoinAsViewer = useCallback(async () => {
      await closeAndUnpublishedLocalStream()
      await dispatch(actions.setStreamerIsPublished(false))
      setShowLocalStreamPublishingModal(false)
      if (currentLivestream.test && !hasDismissedStreamTutorial) {
         handleOpenDemoIntroModal()
      }
   }, [localMediaHandlers, handleOpenDemoIntroModal])

   useEffect(() => {
      const activeStep = getActiveTutorialStepKey()
      if (localStream && activeStep > 0) {
         if (activeStep > 10 && activeStep < 13) {
            if (!remoteStreams.some((stream) => stream.uid === "demoStream")) {
               demoStreamHandlers.addDemoStream()
            }
         } else {
            demoStreamHandlers.removeDemoStream()
         }
      }
   }, [tutorialSteps])

   const isOpen = useCallback(
      (property) => {
         return Boolean(
            currentLivestream.test &&
               tutorialSteps.streamerReady &&
               tutorialSteps[property]
         )
      },
      [currentLivestream?.test, tutorialSteps]
   )

   const handleCloseDemoIntroModal = useCallback(
      (wantsDemo) => {
         setShowDemoIntroModal(false)
         if (wantsDemo) {
            setShowBubbles(true)
            setTutorialSteps({
               ...tutorialSteps,
               streamerReady: true,
            })
         } else {
            setShowBubbles(true)
         }
      },
      [tutorialSteps]
   )

   const handleCloseDemoEndModal = useCallback(() => {
      handleConfirmStep(23)
      endTutorial()
      setShowBubbles(true)
   }, [])

   const handleCloseScreenShareModal = useCallback(() => {
      setShowScreenShareModal(false)
   }, [])

   const handleClickScreenShareButton = useCallback(async () => {
      if (currentLivestream.mode === "desktop") {
         unPublishScreenShareStream().then(async () => {
            return await setDesktopMode("default", streamerId)
         })
      } else {
         setShowScreenShareModal(true)
      }
   }, [currentLivestream?.mode, streamerId, setDesktopMode])

   const onScreenShareStopped = useCallback(() => {
      unPublishScreenShareStream().then(async () => {
         await setDesktopMode("default", streamerId)
      })
   }, [unPublishScreenShareStream])

   const handleScreenShare = useCallback(
      async (optimizationMode = "detail") => {
         if (currentLivestream.mode === "desktop") {
            unPublishScreenShareStream().then(async () => {
               await setDesktopMode("default", streamerId)
            })
         } else {
            publishScreenShareStream(
               optimizationMode,
               onScreenShareStopped
            ).then(async () => {
               await setDesktopMode("desktop", streamerId)
            })
         }
      },
      [optimizationMode, currentLivestream?.mode, streamerId]
   )

   const localStreamIsPublished = useMemo(
      () => ({
         audio: localStream?.isAudioPublished,
         video: localStream?.isVideoPublished,
      }),
      [localStream?.isAudioPublished, localStream?.isVideoPublished]
   )

   const setShowLocalStreamPublishingModalTrue = useCallback(
      () => setShowLocalStreamPublishingModal(true),
      []
   )

   const WifiIndicatorMemoized = useMemo(
      () => (
         <WifiIndicator
            uplink={networkQuality.uplinkNetworkQuality}
            downlink={networkQuality.downlinkNetworkQuality}
         />
      ),
      [networkQuality]
   )

   return (
      <>
         <BreakoutRoomManagementModal leaveAgoraRoom={leaveAgoraRoom} />
         <Streams
            externalMediaStreams={remoteStreams}
            localMediaStream={localStream}
            currentSpeakerId={currentSpeakerId}
            streamerId={streamerId}
            handRaiseActive={currentLivestream.handRaiseActive}
            videoMutedBackgroundImg={currentLivestream.companyLogoUrl}
            liveSpeakers={currentLivestream.liveSpeakers}
            isBroadCasting={!isPlayMode}
            sharingScreen={currentLivestream.mode === "desktop"}
            sharingPdf={currentLivestream.mode === "presentation"}
            sharingVideo={currentLivestream.mode === "video"}
            showMenu={showMenu}
            livestreamId={currentLivestream.id}
            presenter
         />
         <StreamPublishingModal
            open={Boolean(showLocalStreamPublishingModal)}
            setOpen={setShowLocalStreamPublishingModal}
            localStream={localStream}
            deviceInitializers={deviceInitializers}
            displayableMediaStream={displayableMediaStream}
            showSoundMeter={Boolean(
               (showLocalStreamPublishingModal || showSettings) &&
                  localStream.audioTrack
            )}
            devices={devices}
            mediaControls={mediaControls}
            onConfirmStream={handlePublish}
            onRefuseStream={handleJoinAsViewer}
            localMediaHandlers={localMediaHandlers}
            labels={labels}
         />
         <VideoControlsContainer
            currentLivestream={currentLivestream}
            handleClickScreenShareButton={handleClickScreenShareButton}
            streamerId={streamerId}
            isMainStreamer={isMainStreamer}
            localStreamIsPublished={localStreamIsPublished}
            microphoneMuted={!Boolean(localStream.audioTrack?.enabled)}
            cameraInactive={!Boolean(localStream.videoTrack?.enabled)}
            openPublishingModal={setShowLocalStreamPublishingModalTrue}
            joinAsViewer={handleJoinAsViewer}
            viewer={viewer}
            localMediaControls={localMediaControls}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
         />
         <DraggableComponent
            zIndex={3}
            bounds="parent"
            positionStyle={"absolute"}
            defaultPosition={draggableDefaultPosition}
            elementId="wifiIndicatorLocation"
         >
            {WifiIndicatorMemoized}
         </DraggableComponent>
         <AgoraStateHandler />
         <SettingsModal
            open={showSettings}
            close={() => setShowSettings(false)}
            smallScreen={smallScreen}
            devices={devices}
            deviceInitializers={deviceInitializers}
            localMediaHandlers={localMediaHandlers}
            localStream={localStream}
            displayableMediaStream={displayableMediaStream}
            mediaControls={mediaControls}
         />
         {/* <LoadingModal agoraRtcStatus={agoraRtcStatus} />
         <ErrorModal
            agoraRtcStatus={agoraRtcStatus}
            agoraRtmStatus={agoraRtmStatus}
         /> */}
         <ScreenShareModal
            open={showScreenShareModal}
            smallScreen={smallScreen}
            handleClose={handleCloseScreenShareModal}
            handleScreenShare={handleScreenShare}
         />
         <DemoIntroModal
            smallScreen={smallScreen}
            open={showDemoIntroModal}
            handleClose={handleCloseDemoIntroModal}
         />
         <DemoEndModal
            open={isOpen(23)}
            handleClose={handleCloseDemoEndModal}
         />
      </>
   )
}

const draggableDefaultPosition = { x: 4, y: 70 }

export default VideoContainer
