import React, {
   Fragment,
   useCallback,
   useContext,
   useEffect,
   useState,
} from "react";

import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import useAgoraAsStreamer from "components/custom-hook/useAgoraAsStreamer";
import VideoControlsContainer from "./VideoControlsContainer";
import StreamPreparationModalV2 from "../modal/StreamPreparationModalV2/StreamPreparationModalV2";
import useDevices from "components/custom-hook/useDevices";
import makeStyles from "@mui/styles/makeStyles";
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

const useStyles = makeStyles((theme) => ({}));

function VideoContainer({
   currentLivestream,
   isPlayMode,
   showMenu,
   smallScreen,
   streamerId,
   viewer,
}) {
   const firebase = useFirebaseService();
   const {
      tutorialSteps,
      setTutorialSteps,
      showBubbles,
      setShowBubbles,
      handleConfirmStep,
      getActiveTutorialStepKey,
      endTutorial,
   } = useContext(TutorialContext);
   const classes = useStyles();
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
   const [optimizationMode, setOptimizationMode] = useState("detail");
   const [showSettings, setShowSettings] = useState(false);

   const screenSharingMode =
      currentLivestream.screenSharerId === streamerId &&
      currentLivestream.mode === "desktop"
         ? optimizationMode
         : "";

   const {
      localMediaStream,
      setLocalMediaStream,
      externalMediaStreams,
      agoraRtcStatus,
      agoraRtcConnectionStatus,
      agoraRtmStatus,
      networkQuality,
      numberOfViewers,
      createDemoStream,
      setAddedStream,
      setRemovedStream,
      agoraHandlers,
   } = useAgoraAsStreamer(
      true,
      false,
      screenSharingMode,
      currentLivestream.id,
      streamerId,
      viewer
   );

   const devices = useDevices(
      agoraRtcStatus && agoraRtcStatus.msg === "RTC_STREAM_PUBLISHED"
   );

   const {
      audioSource,
      updateAudioSource,
      videoSource,
      updateVideoSource,
      speakerSource,
      updateSpeakerSource,
      localMediaStream: displayableMediaStream,
      audioLevel,
   } = useMediaSources(
      devices,
      streamerId,
      localMediaStream,
      !streamerReady || showSettings
   );
   const currentSpeakerId = useCurrentSpeaker(
      localMediaStream,
      externalMediaStreams
   );

   useEffect(() => {
      if (
         agoraRtcStatus &&
         agoraRtcStatus.type === "INFO" &&
         agoraRtcStatus.msg === "RTC_STREAM_PUBLISHED"
      ) {
         setStreamerConnected(true);
      }
   }, [agoraRtcStatus]);

   useEffect(() => {
      if (
         agoraRtcStatus &&
         (agoraRtcStatus.msg === "RTC_SCREEN_SHARE_STOPPED" ||
            agoraRtcStatus.msg === "RTC_SCREEN_SHARE_NOT_ALLOWED") &&
         currentLivestream.mode === "desktop" &&
         currentLivestream.screenSharerId === streamerId
      ) {
         setDesktopMode("default", streamerId);
      }
   }, [agoraRtcStatus]);

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

   useEffect(() => {
      if (localMediaStream && externalMediaStreams) {
         if (externalMediaStreams.length > 3) {
            if (
               streamerId === currentLivestream.currentSpeakerId &&
               currentLivestream.mode !== "desktop" &&
               currentLivestream.mode !== "presentation"
            ) {
               if (timeoutState) {
                  clearTimeout(timeoutState);
               }
               let newTimeout = setTimeout(() => {
                  localMediaStream.stream.setVideoProfile("480p_9");
               }, 20000);
               setTimeoutState(newTimeout);
            } else {
               if (timeoutState) {
                  clearTimeout(timeoutState);
               }
               let newTimeout = setTimeout(() => {
                  localMediaStream.stream.setVideoProfile("180p");
               }, 20000);
               setTimeoutState(newTimeout);
            }
         } else {
            localMediaStream.stream.setVideoProfile("480p_9");
         }
      }
   }, [
      localMediaStream,
      externalMediaStreams,
      currentLivestream.currentSpeakerId,
      currentLivestream.mode,
   ]);

   const setDesktopMode = async (mode, initiatorId) => {
      let screenSharerId =
         mode === "desktop" ? initiatorId : currentLivestream.screenSharerId;
      await firebase.setDesktopMode(streamRef, mode, screenSharerId);
   };

   useEffect(() => {
      const activeStep = getActiveTutorialStepKey();
      if (localMediaStream && activeStep > 0) {
         if (activeStep > 10 && activeStep < 13) {
            if (
               !externalMediaStreams.some(
                  (stream) => stream.streamId === "demoStream"
               )
            ) {
               createDemoStream({
                  streamId: "demoStream",
                  url:
                     "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media",
               });
               setAddedStream({
                  streamId: "demoStream",
                  url:
                     "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media",
               });
            }
         } else {
            setRemovedStream("demoStream");
         }
      }
   }, [tutorialSteps]);

   const isOpen = (property) => {
      return Boolean(
         currentLivestream.test &&
            tutorialSteps.streamerReady &&
            tutorialSteps[property]
      );
   };

   const handleCloseDemoIntroModal = (wantsDemo) => {
      setShowDemoIntroModal(false);
      if (wantsDemo) {
         setShowBubbles(true);
         setTutorialSteps({
            ...tutorialSteps,
            streamerReady: true,
         });
      } else {
         setShowBubbles(true);
      }
   };

   const handleOpenDemoIntroModal = () => {
      setShowDemoIntroModal(true);
   };

   const handleCloseDemoEndModal = () => {
      handleConfirmStep(23);
      endTutorial();
      setShowBubbles(true);
   };

   const handleCloseScreenShareModal = useCallback(() => {
      setShowScreenShareModal(false);
   }, []);

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
         <BreakoutRoomManagementModal agoraHandlers={agoraHandlers} />
         <Streams
            externalMediaStreams={externalMediaStreams}
            localMediaStream={localMediaStream}
            currentSpeakerId={currentSpeakerId}
            streamerId={streamerId}
            handRaiseActive={currentLivestream.handRaiseActive}
            videoMutedBackgroundImg={currentLivestream.companyLogoUrl}
            setRemovedStream={setRemovedStream}
            liveSpeakers={currentLivestream.liveSpeakers}
            isBroadCasting={!isPlayMode}
            sharingScreen={currentLivestream.mode === "desktop"}
            sharingPdf={currentLivestream.mode === "presentation"}
            showMenu={showMenu}
            livestreamId={currentLivestream.id}
            presenter
         />
         <VideoControlsContainer
            currentLivestream={currentLivestream}
            viewer={viewer}
            streamerId={streamerId}
            joining={!isMainStreamer}
            handleClickScreenShareButton={handleClickScreenShareButton}
            localMediaStream={localMediaStream}
            setLocalMediaStream={setLocalMediaStream}
            isMainStreamer={isMainStreamer}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
         />
         <DraggableComponent
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
            agoraRtcConnectionStatus={agoraRtcConnectionStatus}
         />
         <ScreenShareModal
            open={showScreenShareModal}
            smallScreen={smallScreen}
            handleClose={handleCloseScreenShareModal}
            handleScreenShare={handleScreenShare}
         />

         <DemoIntroModal
            open={showDemoIntroModal}
            handleClose={handleCloseDemoIntroModal}
         />
         <DemoEndModal
            open={isOpen(23)}
            handleClose={handleCloseDemoEndModal}
         />
      </Fragment>
   );
}

export default VideoContainer;
