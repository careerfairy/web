import React, {
   Fragment,
   useCallback,
   useContext,
   useEffect,
   useState,
} from "react";

import { useFirebase, withFirebasePage } from "context/firebase";
import useAgoraAsStreamer from "components/custom-hook/useAgoraAsStreamer";
import VideoControlsContainer from "./VideoControlsContainer";
import StreamPreparationModalV2 from "../modal/StreamPreparationModalV2/StreamPreparationModalV2";
import useDevices from "components/custom-hook/useDevices";
import { makeStyles } from "@material-ui/core/styles";
import TutorialContext from "context/tutorials/TutorialContext";
import DemoIntroModal from "../modal/DemoIntroModal";
import DemoEndModal from "../modal/DemoEndModal";

import useMediaSources from "components/custom-hook/useMediaSources";
import WifiIndicator from "./WifiIndicator";
import LoadingModal from "../modal/LoadingModal";
import ErrorModal from "../modal/ErrorModal";
import SettingsModal from "./SettingsModal";
import ScreenShareModal from "./ScreenShareModal";
import useStreamRef from "../../../custom-hook/useStreamRef";
import BreakoutRoomManagementModal from "../../../../layouts/StreamerLayout/StreamerTopBar/BreakoutRoomManagementModal";
import useCurrentSpeaker from "../../../custom-hook/useCurrentSpeaker";
import Streams from "./Streams";
import DraggableComponent from "../../banners/DraggableComponent";
import useAgora from "components/custom-hook/useAgora";
import StreamPublishingModal from "../modal/StreamPublishingModal";

const useStyles = makeStyles((theme) => ({}));

function VideoContainer({
   currentLivestream,
   isPlayMode,
   showMenu,
   smallScreen,
   streamerId,
   viewer,
}) {
   const firebase = useFirebase();
   const {
      tutorialSteps,
      setTutorialSteps,
      showBubbles,
      setShowBubbles,
      handleConfirmStep,
      getActiveTutorialStepKey,
      endTutorial,
   } = useContext(TutorialContext);
   const localVideoId = "localVideo";
   const isMainStreamer = streamerId === currentLivestream.id;
   const streamRef = useStreamRef();
   const [errorMessage, setErrorMessage] = useState(null);
   const [showDemoIntroModal, setShowDemoIntroModal] = useState(false);
   const [streamerConnected, setStreamerConnected] = useState(false);
   const [streamerReady, setStreamerReady] = useState(false);

   const [connectionEstablished, setConnectionEstablished] = useState(false);
   const [isStreaming, setIsStreaming] = useState(false);
   const [showScreenShareModal, setShowScreenShareModal] = useState(false);
   const [
      showLocalStreamPublishingModal,
      setShowLocalStreamPublishingModal,
   ] = useState(true);
   const [optimizationMode, setOptimizationMode] = useState("detail");

   const [showSettings, setShowSettings] = useState(false);

   const screenSharingMode =
      currentLivestream.screenSharerId === streamerId &&
      currentLivestream.mode === "desktop"
         ? optimizationMode
         : "";

   // const {
   //    localMediaStream,
   //    setLocalMediaStream,
   //    externalUsers,
   //    agoraRtcStatus,
   //    agoraRtcConnectionStatus,
   //    agoraRtmStatus,
   //    networkQuality,
   //    agoraHandlers,
   //    numberOfViewers,
   //    createDemoStream,
   //    setAddedStream,
   //    setRemovedStream,
   // } = useAgoraAsStreamer(
   //    true,
   //    false,
   //    screenSharingMode,
   //    currentLivestream.id,
   //    streamerId,
   //    viewer
   // );

   const isStreamer = true;
   const {
      localStream,
      localMediaControls,
      remoteStreams,
      publishLocalCameraStream,
   } = useAgora(streamerId, isStreamer);

   const devices = useDevices(Boolean(localStream));

   const {
      mediaControls,
      localMediaStream: displayableMediaStream,
   } = useMediaSources(devices, localStream, !streamerReady || showSettings);

   const currentSpeakerId = useCurrentSpeaker(localStream, []);

   // useEffect(() => {
   //    if (
   //       agoraRtcStatus &&
   //       agoraRtcStatus.type === "INFO" &&
   //       agoraRtcStatus.msg === "RTC_STREAM_PUBLISHED"
   //    ) {
   //       setStreamerConnected(true);
   //    }
   // }, [agoraRtcStatus]);

   // useEffect(() => {
   //    if (
   //       agoraRtcStatus &&
   //       (agoraRtcStatus.msg === "RTC_SCREEN_SHARE_STOPPED" ||
   //          agoraRtcStatus.msg === "RTC_SCREEN_SHARE_NOT_ALLOWED") &&
   //       currentLivestream.mode === "desktop" &&
   //       currentLivestream.screenSharerId === streamerId
   //    ) {
   //       setDesktopMode("default", streamerId);
   //    }
   // }, [agoraRtcStatus]);

   useEffect(() => {
      if (streamerId && currentLivestream.id) {
         if (
            currentLivestream.mode === "desktop" &&
            currentLivestream.screenSharerId === streamerId
         ) {
            setDesktopMode("default", streamerId);
         }
      }
   }, [streamerId, currentLivestream.id]);

   const [timeoutState, setTimeoutState] = useState(null);

   // useEffect(() => {
   //    dynamicallyUpdateVideoProfile();
   // }, [
   //    localMediaStream,
   //    externalUsers,
   //    props.currentLivestream.currentSpeakerId,
   //    props.currentLivestream.mode,
   // ]);

   // const dynamicallyUpdateVideoProfile = async () => {
   //    if (localMediaStream && externalUsers) {
   //       if (externalUsers.length > 3) {
   //          if (
   //             streamerId === currentLivestream.currentSpeakerId &&
   //             currentLivestream.mode !== "desktop" &&
   //             currentLivestream.mode !== "presentation"
   //          ) {
   //             if (timeoutState) {
   //                clearTimeout(timeoutState);
   //             }
   //             let newTimeout = setTimeout(() => {
   //                localMediaStream.videoTrack.setEncoderConfiguration("480p_9");
   //             }, 20000);
   //             setTimeoutState(newTimeout);
   //          } else {
   //             if (timeoutState) {
   //                clearTimeout(timeoutState);
   //             }
   //             let newTimeout = setTimeout(() => {
   //                localMediaStream.videoTrack.setEncoderConfiguration("180p");
   //             }, 20000);
   //             setTimeoutState(newTimeout);
   //          }
   //       } else {
   //          localMediaStream.videoTrack.setEncoderConfiguration("480p_9");
   //       }
   //    }
   // };

   const setDesktopMode = async (mode, initiatorId) => {
      let screenSharerId =
         mode === "desktop" ? initiatorId : currentLivestream.screenSharerId;
      await firebase.setDesktopMode(streamRef, mode, screenSharerId);
   };

   const handlePublishLocalStream = () => {
      publishLocalCameraStream()
         .then(() => {
            setShowLocalStreamPublishingModal(false);
         })
         .catch(() => {});
   };

   // useEffect(() => {
   //    const activeStep = getActiveTutorialStepKey();
   //    if (localMediaStream && activeStep > 0) {
   //       if (activeStep > 10 && activeStep < 13) {
   //          if (
   //             !externalUsers.some((stream) => stream.streamId === "demoStream")
   //          ) {
   //             createDemoStream({
   //                streamId: "demoStream",
   //                url:
   //                   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media",
   //             });
   //             setAddedStream({
   //                streamId: "demoStream",
   //                url:
   //                   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media",
   //             });
   //          }
   //       } else {
   //          setRemovedStream("demoStream");
   //       }
   //    }
   // }, [tutorialSteps]);

   // const isOpen = (property) => {
   //    return Boolean(
   //       currentLivestream.test &&
   //          tutorialSteps.streamerReady &&
   //          tutorialSteps[property]
   //    );
   // };

   // const handleCloseDemoIntroModal = (wantsDemo) => {
   //    setShowDemoIntroModal(false);
   //    if (wantsDemo) {
   //       setShowBubbles(true);
   //       setTutorialSteps({
   //          ...tutorialSteps,
   //          streamerReady: true,
   //       });
   //    } else {
   //       setShowBubbles(true);
   //    }
   // };

   // const handleOpenDemoIntroModal = () => {
   //    setShowDemoIntroModal(true);
   // };

   // const handleCloseDemoEndModal = () => {
   //    handleConfirmStep(23);
   //    endTutorial();
   //    setShowBubbles(true);
   // };

   // const handleCloseScreenShareModal = useCallback(() => {
   //    setShowScreenShareModal(false);
   // }, []);

   const handleClickScreenShareButton = async () => {
      if (currentLivestream.mode === "desktop") {
         return await setDesktopMode("default", streamerId);
      }
      setShowScreenShareModal(true);
   };

   const handleScreenShare = useCallback(
      async (optimizationMode = "detail") => {
         setOptimizationMode(optimizationMode);
         await setDesktopMode(
            currentLivestream.mode === "desktop" ? "default" : "desktop",
            streamerId
         );
      },
      [optimizationMode, currentLivestream?.mode, streamerId]
   );

   return (
      <Fragment>
         {/* <BreakoutRoomManagementModal agoraHandlers={agoraHandlers} /> */}
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
            showMenu={showMenu}
            livestreamId={currentLivestream.id}
            presenter
         />
         <StreamPublishingModal
            open={showLocalStreamPublishingModal}
            setOpen={setShowLocalStreamPublishingModal}
            displayableMediaStream={displayableMediaStream}
            devices={devices}
            mediaControls={mediaControls}
            onConfirmStream={handlePublishLocalStream}
         />
         <VideoControlsContainer
            currentLivestream={currentLivestream}
            handleClickScreenShareButton={handleClickScreenShareButton}
            streamerId={streamerId}
            isMainStreamer={isMainStreamer}
            viewer={viewer}
            localMediaControls={localMediaControls}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
         />
         {/* <DraggableComponent
            zIndex={3}
            bounds="parent"
            positionStyle={"absolute"}
            defaultPosition={{ x: 4, y: 70 }}
            elementId="wifiIndicatorLocation"
         >
            <WifiIndicator
               uplink={networkQuality.uplinkNetworkQuality}
               downlink={networkQuality.downlinkNetworkQuality}
               agoraRtcConnectionStatus={agoraRtcConnectionStatus}
               agoraRtmStatus={agoraRtmStatus}
            />
         </DraggableComponent>
         <SettingsModal
            open={showSettings}
            close={() => setShowSettings(false)}
            smallScreen={smallScreen}
            devices={devices}
            displayableMediaStream={displayableMediaStream}
            audioSource={audioSource}
            updateAudioSource={updateAudioSource}
            videoSource={videoSource}
            updateVideoSource={updateVideoSource}
            audioLevel={audioLevel}
         />
         <StreamPreparationModalV2
            readyToConnect={Boolean(currentLivestream && currentLivestream.id)}
            audioSource={audioSource}
            updateAudioSource={updateAudioSource}
            videoSource={videoSource}
            updateVideoSource={updateVideoSource}
            speakerSource={speakerSource}
            setSpeakerSource={updateSpeakerSource}
            audioLevel={audioLevel}
            streamerConnected={streamerConnected}
            streamerReady={streamerReady}
            setStreamerReady={setStreamerReady}
            localStream={displayableMediaStream}
            connectionEstablished={connectionEstablished}
            isTest={currentLivestream.test}
            viewer={viewer}
            handleOpenDemoIntroModal={handleOpenDemoIntroModal}
            devices={devices}
            setConnectionEstablished={setConnectionEstablished}
            errorMessage={errorMessage}
            isStreaming={isStreaming}
         />
         <LoadingModal agoraRtcStatus={agoraRtcStatus} />
         <ErrorModal
            agoraRtcStatus={agoraRtcStatus}
            agoraRtmStatus={agoraRtmStatus}
         /> */}
         {/* <ScreenShareModal
            open={showScreenShareModal}
            smallScreen={smallScreen}
            handleClose={handleCloseScreenShareModal}
            handleScreenShare={handleScreenShare}
         /> */}

         {/* <DemoIntroModal
            open={showDemoIntroModal}
            handleClose={handleCloseDemoIntroModal}
         />
         <DemoEndModal
            open={isOpen(23)}
            handleClose={handleCloseDemoEndModal}
         /> */}
      </Fragment>
   );
}

export default VideoContainer;
