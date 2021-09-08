import React, {
   Fragment,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react";

import { withFirebasePage } from "context/firebase";
import useAgoraAsStreamer from "components/custom-hook/useAgoraAsStreamer";
import CurrentSpeakerDisplayer from "./CurrentSpeakerDisplayer";
import SmallStreamerVideoDisplayer from "./SmallStreamerVideoDisplayer";
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

const useStyles = makeStyles((theme) => ({}));

function VideoContainer(props) {
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
   const isMainStreamer = props.streamerId === props.currentLivestream.id;
   const streamRef = useStreamRef();
   const [errorMessage, setErrorMessage] = useState(null);
   const [
      screenSharePermissionDenied,
      setScreenSharePermissionDenied,
   ] = useState(false);
   const [showDemoIntroModal, setShowDemoIntroModal] = useState(false);
   // console.count("-> VideoContainer");
   const [streamerConnected, setStreamerConnected] = useState(false);
   const [streamerReady, setStreamerReady] = useState(false);

   const [connectionEstablished, setConnectionEstablished] = useState(false);
   const [isStreaming, setIsStreaming] = useState(false);
   const [showScreenShareModal, setShowScreenShareModal] = useState(false);
   const [optimizationMode, setOptimizationMode] = useState("detail");
   const [showSettings, setShowSettings] = useState(false);

   const screenSharingMode =
      props.currentLivestream.screenSharerId === props.streamerId &&
      props.currentLivestream.mode === "desktop"
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
      setAddedStream,
      setRemovedStream,
      agoraHandlers,
   } = useAgoraAsStreamer(
      true,
      false,
      localVideoId,
      screenSharingMode,
      props.currentLivestream.id,
      props.streamerId,
      props.viewer
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
      props.streamerId,
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
         props.currentLivestream.mode === "desktop" &&
         props.currentLivestream.screenSharerId === props.streamerId
      ) {
         setDesktopMode("default", props.streamerId);
      }
   }, [agoraRtcStatus]);

   useEffect(() => {
      if (props.streamerId && props.currentLivestream.id) {
         if (
            props.currentLivestream.mode === "desktop" &&
            props.currentLivestream.screenSharerId === props.streamerId
         ) {
            setDesktopMode("default", props.streamerId);
         }
      }
   }, [props.streamerId, props.currentLivestream.id]);

   const [timeoutState, setTimeoutState] = useState(null);

   useEffect(() => {
      if (localMediaStream && externalMediaStreams) {
         if (externalMediaStreams.length > 3) {
            if (
               props.streamerId === props.currentLivestream.currentSpeakerId &&
               props.currentLivestream.mode !== "desktop" &&
               props.currentLivestream.mode !== "presentation"
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
      props.currentLivestream.currentSpeakerId,
      props.currentLivestream.mode,
   ]);

   const setDesktopMode = async (mode, initiatorId) => {
      let screenSharerId =
         mode === "desktop"
            ? initiatorId
            : props.currentLivestream.screenSharerId;
      await props.firebase.setDesktopMode(streamRef, mode, screenSharerId);
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
         props.currentLivestream.test &&
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
      if (props.currentLivestream.mode === "desktop") {
         return await setDesktopMode("default", props.streamerId);
      }
      setShowScreenShareModal(true);
   };

   const handleScreenShare = useCallback(
      async (optimizationMode = "detail") => {
         setOptimizationMode(optimizationMode);
         await setDesktopMode(
            props.currentLivestream.mode === "desktop" ? "default" : "desktop",
            props.streamerId
         );
      },
      [optimizationMode, props.currentLivestream?.mode, props.streamerId]
   );

   const sharingContent = useMemo(
      () =>
         props.currentLivestream.mode === "presentation" ||
         props.currentLivestream.mode === "desktop",
      [props.currentLivestream.mode]
   );

   return (
      <Fragment>
         <BreakoutRoomManagementModal agoraHandlers={agoraHandlers} />
         <Streams
            externalMediaStreams={externalMediaStreams}
            localMediaStream={localMediaStream}
            currentSpeakerId={currentSpeakerId}
            sharingContent={sharingContent}
         />
         {/*<div>*/}
         {/*   <CurrentSpeakerDisplayer*/}
         {/*      isPlayMode={false}*/}
         {/*      streamTitle={props.currentLivestream.title}*/}
         {/*      smallScreenMode={*/}
         {/*         props.currentLivestream.mode === "presentation" ||*/}
         {/*         props.currentLivestream.mode === "desktop"*/}
         {/*      }*/}
         {/*      speakerSwitchModeActive={isMainStreamer}*/}
         {/*      localId={props.streamerId}*/}
         {/*      localStream={localMediaStream}*/}
         {/*      speakerSource={speakerSource}*/}
         {/*      isStreamer={props.isStreamer}*/}
         {/*      isBreakout={props.isBreakout}*/}
         {/*      streams={externalMediaStreams}*/}
         {/*      currentSpeaker={currentSpeakerId}*/}
         {/*      setRemovedStream={setRemovedStream}*/}
         {/*      {...props}*/}
         {/*      muted={false}*/}
         {/*   />*/}
         {/*</div>*/}
         {/*{sharingContent && (*/}
         {/*   <SmallStreamerVideoDisplayer*/}
         {/*      livestreamId={props.currentLivestream.id}*/}
         {/*      isBreakout={props.isBreakout}*/}
         {/*      presentation={props.currentLivestream.mode === "presentation"}*/}
         {/*      showMenu={props.showMenu}*/}
         {/*      externalMediaStreams={externalMediaStreams}*/}
         {/*      isLocalScreen={screenSharingMode}*/}
         {/*      presenter={true}*/}
         {/*   />*/}
         {/*)}*/}
         <VideoControlsContainer
            currentLivestream={props.currentLivestream}
            viewer={props.viewer}
            streamerId={props.streamerId}
            joining={!isMainStreamer}
            handleClickScreenShareButton={handleClickScreenShareButton}
            localMediaStream={localMediaStream}
            setLocalMediaStream={setLocalMediaStream}
            isMainStreamer={isMainStreamer}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
         />
         <WifiIndicator
            uplink={networkQuality.uplinkNetworkQuality}
            downlink={networkQuality.downlinkNetworkQuality}
            agoraRtcConnectionStatus={agoraRtcConnectionStatus}
            agoraRtmStatus={agoraRtmStatus}
         />
         <SettingsModal
            open={showSettings}
            close={() => setShowSettings(false)}
            streamId={props.streamerId}
            smallScreen={props.smallScreen}
            devices={devices}
            localStream={localMediaStream}
            displayableMediaStream={displayableMediaStream}
            audioSource={audioSource}
            updateAudioSource={updateAudioSource}
            videoSource={videoSource}
            updateVideoSource={updateVideoSource}
            audioLevel={audioLevel}
            speakerSource={speakerSource}
            setSpeakerSource={updateSpeakerSource}
         />
         <StreamPreparationModalV2
            readyToConnect={Boolean(
               props.currentLivestream && props.currentLivestream.id
            )}
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
            isTest={props.currentLivestream.test}
            viewer={props.viewer}
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
            smallScreen={props.smallScreen}
            handleClose={handleCloseScreenShareModal}
            handleScreenShare={handleScreenShare}
         />

         <DemoIntroModal
            livestreamId={props.currentLivestream.id}
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

export default withFirebasePage(VideoContainer);
