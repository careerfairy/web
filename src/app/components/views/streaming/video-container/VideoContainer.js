import React, {
   Fragment,
   useCallback,
   useContext,
   useEffect,
   useState,
} from "react";

import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import VideoControlsContainer from "./VideoControlsContainer";
import useDevices from "components/custom-hook/useDevices";
import TutorialContext from "context/tutorials/TutorialContext";
import DemoIntroModal from "../modal/DemoIntroModal";
import DemoEndModal from "../modal/DemoEndModal";

import useMediaSources from "components/custom-hook/useMediaSources";
import WifiIndicator from "./WifiIndicator";
// import LoadingModal from "../modal/LoadingModal";
// import ErrorModal from "../modal/ErrorModal";
import SettingsModal from "./SettingsModal";
import ScreenShareModal from "./ScreenShareModal";
import useStreamRef from "../../../custom-hook/useStreamRef";
import BreakoutRoomManagementModal from "../../../../layouts/StreamerLayout/StreamerTopBar/BreakoutRoomManagementModal";
import useCurrentSpeaker from "../../../custom-hook/useCurrentSpeaker";
import Streams from "./Streams";
import DraggableComponent from "../../banners/DraggableComponent";
import useAgoraRtc from "components/custom-hook/useAgoraRtc";
import StreamPublishingModal from "../modal/StreamPublishingModal";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import AgoraStateHandler from "../modal/AgoraStateModal/AgoraStateHandler";

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
};
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
      setShowBubbles,
      handleConfirmStep,
      getActiveTutorialStepKey,
      endTutorial,
   } = useContext(TutorialContext);
   const isMainStreamer = streamerId === currentLivestream.id;
   const streamRef = useStreamRef();
   const dispatch = useDispatch();
   const [showDemoIntroModal, setShowDemoIntroModal] = useState(false);

   const [showScreenShareModal, setShowScreenShareModal] = useState(false);
   const [
      showLocalStreamPublishingModal,
      setShowLocalStreamPublishingModal,
   ] = useState(true);
   const [optimizationMode, setOptimizationMode] = useState("detail");

   const [showSettings, setShowSettings] = useState(false);

   const isStreamer = true;
   const {
      networkQuality,
      localStream,
      localMediaControls,
      remoteStreams,
      publishLocalStreamTracks,
      publishScreenShareStream,
      unpublishScreenShareStream,
      leaveAgoraRoom,
      localMediaHandlers,
      handleEnableCloudProxy,
      handleReconnectAgora,
      handlePublishLocalStream,
   } = useAgoraRtc(streamerId, currentLivestream.id, isStreamer);

   const devices = useDevices(localStream);

   const {
      mediaControls,
      localMediaStream: displayableMediaStream,
   } = useMediaSources(devices, localStream, true);

   const currentSpeakerId = useCurrentSpeaker(localStream, remoteStreams);

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
      dynamicallyUpdateVideoProfile();
   }, [
      localStream,
      remoteStreams,
      currentLivestream.currentSpeakerId,
      currentLivestream.mode,
   ]);

   const handlePublish = async () => {
      try {
         await handlePublishLocalStream();
         setShowLocalStreamPublishingModal(false);
      } catch (e) {
         console.log("-> error in HANDLE PUBLISH", e);
      }
   };

   const dynamicallyUpdateVideoProfile = async () => {
      if (localStream?.videoTrack) {
         if (remoteStreams?.length > 3) {
            if (
               streamerId === currentLivestream.currentSpeakerId &&
               currentLivestream.mode !== "desktop" &&
               currentLivestream.mode !== "presentation"
            ) {
               if (timeoutState) {
                  clearTimeout(timeoutState);
               }
               let newTimeout = scheduleEncoderConfigurationSwitchTo("480p_9");
               setTimeoutState(newTimeout);
            } else {
               if (timeoutState) {
                  clearTimeout(timeoutState);
               }
               let newTimeout = scheduleEncoderConfigurationSwitchTo("180p");
               setTimeoutState(newTimeout);
            }
         } else {
            if (localStream?.isVideoPublished) {
               try {
                  await localStream.videoTrack.setEncoderConfiguration(
                     "480p_9"
                  );
               } catch (error) {
                  if (error.code === "TRACK_IS_DISABLED") {
                     console.log("Couldn't process encoding configuration");
                  }
               }
            }
         }
      }
   };

   const scheduleEncoderConfigurationSwitchTo = (videoResolution) => {
      return setTimeout(async () => {
         try {
            await localStream.videoTrack.setEncoderConfiguration(
               videoResolution
            );
         } catch (error) {
            if (error.code === "TRACK_IS_DISABLED") {
               console.log("Couldn't process encoding configuration");
            }
         }
      }, 20000);
   };

   const setDesktopMode = async (mode, initiatorId) => {
      let screenSharerId =
         mode === "desktop" ? initiatorId : currentLivestream.screenSharerId;
      await firebase.setDesktopMode(streamRef, mode, screenSharerId);
   };

   const handleJoinAsViewer = useCallback(async () => {
      await localMediaHandlers.closeLocalCameraTrack();
      await localMediaHandlers.closeLocalMicrophoneTrack();
      await dispatch(actions.setStreamerIsPublished(false));
      setShowLocalStreamPublishingModal(false);
   }, [localMediaHandlers]);

   useEffect(() => {
      const activeStep = getActiveTutorialStepKey();
      if (localStream && activeStep > 0) {
         if (activeStep > 10 && activeStep < 13) {
            if (!remoteStreams.some((stream) => stream.uid === "demoStream")) {
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
         unpublishScreenShareStream().then(async () => {
            return await setDesktopMode("default", streamerId);
         });
      } else {
         setShowScreenShareModal(true);
      }
   };

   const onScreenShareStopped = useCallback(() => {
      unpublishScreenShareStream().then(async () => {
         await setDesktopMode("default", streamerId);
      });
   }, [unpublishScreenShareStream]);

   const handleScreenShare = useCallback(
      async (optimizationMode = "detail") => {
         if (currentLivestream.mode === "desktop") {
            unpublishScreenShareStream().then(async () => {
               await setDesktopMode("default", streamerId);
            });
         } else {
            publishScreenShareStream(
               optimizationMode,
               onScreenShareStopped
            ).then(async () => {
               await setDesktopMode("desktop", streamerId);
            });
         }
      },
      [optimizationMode, currentLivestream?.mode, streamerId]
   );

   return (
      <Fragment>
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
            showMenu={showMenu}
            livestreamId={currentLivestream.id}
            presenter
         />
         <StreamPublishingModal
            open={showLocalStreamPublishingModal}
            setOpen={setShowLocalStreamPublishingModal}
            localStream={localStream}
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
            localStreamIsPublished={{
               audio: localStream?.isAudioPublished,
               video: localStream?.isVideoPublished,
            }}
            openPublishingModal={() => setShowLocalStreamPublishingModal(true)}
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
            defaultPosition={{ x: 4, y: 70 }}
            elementId="wifiIndicatorLocation"
         >
            <WifiIndicator
               uplink={networkQuality.uplinkNetworkQuality}
               downlink={networkQuality.downlinkNetworkQuality}
               agoraRtcConnectionStatus={{}}
            />
         </DraggableComponent>
         <AgoraStateHandler
            handleReconnectAgora={handleReconnectAgora}
            handleEnableCloudProxy={handleEnableCloudProxy}
         />
         <SettingsModal
            open={showSettings}
            close={() => setShowSettings(false)}
            smallScreen={smallScreen}
            devices={devices}
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
