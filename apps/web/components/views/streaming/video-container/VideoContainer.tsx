import React, {
   memo,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import VideoControlsContainer from "./VideoControlsContainer"
import useDevices from "../../../../components/custom-hook/useDevices"
import TutorialContext from "../../../../context/tutorials/TutorialContext"
import DemoIntroModal from "../modal/DemoIntroModal"
import DemoEndModal from "../modal/DemoEndModal"
import { useLocalStorage } from "react-use"

import useMediaSources from "../../../../components/custom-hook/useMediaSources"
import WifiIndicator from "./WifiIndicator"
import SettingsModal from "./SettingsModal"
import ScreenShareModal from "./ScreenShareModal"
import BreakoutRoomManagementModal from "../../../../layouts/StreamerLayout/StreamerTopBar/BreakoutRoomManagementModal"
import useCurrentSpeaker from "../../../custom-hook/useCurrentSpeaker"
import Streams from "./Streams"
import DraggableComponent from "../../banners/DraggableComponent"
import StreamPublishingModal from "../modal/StreamPublishingModal"
import { useDispatch } from "react-redux"
import * as actions from "../../../../store/actions"
import AgoraStateHandler from "../modal/AgoraStateModal/AgoraStateHandler"
import { useRouter } from "next/router"
import {
   getVideoEncoderPreset,
   useRtc,
} from "../../../../context/agora/RTCProvider"
import { useCurrentStream } from "../../../../context/stream/StreamContext"
import { errorLogAndNotify } from "../../../../util/CommonUtil"

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

interface Props {
   isPlayMode?: boolean
   showMenu: boolean
   smallScreen: boolean
   viewer: boolean
   openSupportInLeftMenu: () => void
}

const VideoContainer = ({
   isPlayMode,
   showMenu,
   smallScreen,
   viewer,
   openSupportInLeftMenu,
}: Props) => {
   const { currentLivestream, streamerId, isBreakout } = useCurrentStream()
   const {
      tutorialSteps,
      setTutorialSteps,
      setShowBubbles,
      handleConfirmStep,
      getActiveTutorialStepKey,
      endTutorial,
   } = useContext(TutorialContext)
   const isMainStreamer = streamerId === currentLivestream.id
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

   const [showSettings, setShowSettings] = useState(false)

   // used to only change the agora preset if it's different from the current one
   const [currentVideoPreset, setCurrentVideoPreset] = useState(
      getVideoEncoderPreset(withHighQuality)
   )

   const {
      networkQuality,
      localStream,
      localMediaControls,
      remoteStreams,
      screenShareStreamRef,
      unPublishScreenShareStream,
      leaveAgoraRoom,
      localMediaHandlers,
      handlePublishLocalStream,
      closeAndUnpublishedLocalStream,
      demoStreamHandlers,
      handleScreenShare,
      setDesktopMode,
   } = useRtc()

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

   const currentSpeakerId = useCurrentSpeaker(
      localStream,
      remoteStreams
   ) as string

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
      if (!screenShareStreamRef?.current) return

      const isSharingPdfOrYoutube = ["presentation", "video"].includes(
         currentLivestream.mode
      )

      const thereIsANewScreenSharer =
         currentLivestream.screenSharerId !== streamerId

      if (isSharingPdfOrYoutube || thereIsANewScreenSharer) {
         void unPublishScreenShareStream().catch(errorLogAndNotify) // We unpublish the current user's screen share stream if a pdf or youtube video is being shared OR someone else started sharing their screen
      }
   }, [
      currentLivestream.mode,
      screenShareStreamRef,
      currentLivestream.screenSharerId,
      streamerId,
   ])

   const setVideoQuality = useCallback(
      async (quality) => {
         try {
            if (
               localStream.isVideoPublished &&
               currentVideoPreset !== quality
            ) {
               await localStream.videoTrack.setEncoderConfiguration(quality)
               setCurrentVideoPreset(quality)
            }
         } catch (e) {
            console.log("-> e in set video quality", e)
            dispatch(actions.setAgoraRtcError(e))
         }
      },
      [
         currentVideoPreset,
         dispatch,
         localStream.isVideoPublished,
         localStream.videoTrack,
      ]
   )

   /**
    * Downgrade the local stream video quality if:
    *  > 3 streamers
    *  no highQuality flag
    */
   useEffect(() => {
      if (
         remoteStreams &&
         !withHighQuality && // if we have high quality flag, we don't downgrade ever our quality
         localStream?.videoTrack &&
         localStream?.isVideoPublished
      ) {
         const manyStreams = remoteStreams.length > 3
         const defaultPreset = getVideoEncoderPreset(withHighQuality)
         if (manyStreams) {
            const iAmBig = IAmCurrentlySpeakingAndBig(
               streamerId,
               currentSpeakerId,
               currentLivestream.speakerSwitchMode,
               currentLivestream.mode
            )

            /**
             * Do not switch the resolutions right away because there is an odd effect
             * when this happens, instead delay it a little bit
             */
            if (iAmBig) {
               // reset to original quality
               const makeStreamerHigherQualityTimeout = setTimeout(() => {
                  void setVideoQuality(defaultPreset)
               }, 10000)

               return () => clearTimeout(makeStreamerHigherQualityTimeout)
            } else {
               // downgrade quality to save bandwidth
               const makeStreamerLowerQualityTimeout = setTimeout(() => {
                  void setVideoQuality("180p")
               }, 10000)

               return () => clearTimeout(makeStreamerLowerQualityTimeout)
            }
         } else {
            // if not manyStreams then make the local stream the default quality
            void setVideoQuality(defaultPreset)
         }
      }
   }, [
      localStream,
      remoteStreams,
      currentSpeakerId,
      currentLivestream.mode,
      withHighQuality,
      streamerId,
      currentLivestream.speakerSwitchMode,
      setVideoQuality,
   ])

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
   }, [
      closeAndUnpublishedLocalStream,
      dispatch,
      currentLivestream.test,
      hasDismissedStreamTutorial,
      handleOpenDemoIntroModal,
   ])

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
      [setShowBubbles, setTutorialSteps, tutorialSteps]
   )

   const handleCloseDemoEndModal = useCallback(() => {
      handleConfirmStep(23)
      endTutorial()
      setShowBubbles(true)
   }, [endTutorial, handleConfirmStep, setShowBubbles])

   const handleCloseScreenShareModal = useCallback(() => {
      setShowScreenShareModal(false)
   }, [])

   const handleClickScreenShareButton = useCallback(async () => {
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
   }, [
      currentLivestream.mode,
      unPublishScreenShareStream,
      setDesktopMode,
      streamerId,
   ])

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

   const closeSettings = useCallback(() => {
      setShowSettings(false)
   }, [])

   return (
      <>
         <BreakoutRoomManagementModal leaveAgoraRoom={leaveAgoraRoom} />
         <Streams
            externalMediaStreams={remoteStreams}
            localMediaStream={localStream}
            currentSpeakerId={currentSpeakerId as string}
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
            openSupportInLeftMenu={openSupportInLeftMenu}
            presenter
         />
         {Boolean(showLocalStreamPublishingModal) && (
            <StreamPublishingModal
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
         )}
         <VideoControlsContainer
            currentLivestream={currentLivestream}
            handleClickScreenShareButton={handleClickScreenShareButton}
            streamerId={streamerId}
            isMainStreamer={isMainStreamer}
            localStreamIsPublished={localStreamIsPublished}
            microphoneMuted={Boolean(localStream.audioTrack?.muted)}
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
            defaultPosition={getDefaultPosition(
               isBreakout,
               currentLivestream?.handRaiseActive
            )}
            elementId="wifiIndicatorLocation"
            key={`wifi-${currentLivestream?.handRaiseActive}`}
         >
            {WifiIndicatorMemoized}
         </DraggableComponent>
         <AgoraStateHandler />
         {showSettings && (
            <SettingsModal
               close={closeSettings}
               smallScreen={smallScreen}
               devices={devices}
               deviceInitializers={deviceInitializers}
               localMediaHandlers={localMediaHandlers}
               localStream={localStream}
               displayableMediaStream={displayableMediaStream}
               mediaControls={mediaControls}
            />
         )}
         {showScreenShareModal && (
            <ScreenShareModal
               open={showScreenShareModal}
               smallScreen={smallScreen}
               handleClose={handleCloseScreenShareModal}
               handleScreenShare={handleScreenShare}
            />
         )}
         {showDemoIntroModal && (
            <DemoIntroModal
               smallScreen={smallScreen}
               open={showDemoIntroModal}
               handleClose={handleCloseDemoIntroModal}
            />
         )}
         {isOpen(23) && (
            <DemoEndModal
               open={isOpen(23)}
               handleClose={handleCloseDemoEndModal}
            />
         )}
      </>
   )
}

function IAmCurrentlySpeakingAndBig(
   streamerId: string,
   currentSpeakerId: string,
   speakerSwitchMode: string,
   livestreamMode: string
) {
   if (
      livestreamMode === "desktop" || // screen sharing
      livestreamMode === "presentation" || // pdf sharing
      livestreamMode === "video" // youtube video
   ) {
      return false
   }

   return streamerId === currentSpeakerId
}

/**
 * Push the Wi-Fi status component below accordingly with the current active
 * banners
 * @param isBreakoutRoom
 * @param handRaiseActive
 */
function getDefaultPosition(isBreakoutRoom, handRaiseActive) {
   const position = { x: 0, y: 65 }

   if (isBreakoutRoom) {
      position.y = position.y += 65
   }

   if (handRaiseActive) {
      position.y = position.y += 65
   }

   return position
}

export default memo(VideoContainer)
