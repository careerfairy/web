import React, { Fragment, useCallback, useEffect, useState } from "react";
import { withFirebasePage } from "context/firebase";
import useAgoraAsStreamer from "components/custom-hook/useAgoraAsStreamer";
import useDevices from "components/custom-hook/useDevices";
import { useFirebase } from "context/firebase";
import useMediaSources from "components/custom-hook/useMediaSources";
import VideoControlsContainer from "components/views/streaming/video-container/VideoControlsContainer";
import { useAuth } from "HOCs/AuthProvider";
import { makeStyles } from "@material-ui/core/styles";
import SettingsModal from "../../streaming/video-container/SettingsModal";
import { Typography } from "@material-ui/core";
import ScreenShareModal from "../../streaming/video-container/ScreenShareModal";
import LoadingModal from "components/views/streaming/modal/LoadingModal";
import ErrorModal from "components/views/streaming/modal/ErrorModal";
import useStreamRef from "../../../custom-hook/useStreamRef";
import EmoteButtons from "../EmoteButtons";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import * as actions from "store/actions";
import useCurrentSpeaker from "../../../custom-hook/useCurrentSpeaker";
import Streams from "../../streaming/video-container/Streams";
import DraggableComponent from "../../banners/DraggableComponent";
import WifiIndicator from "../../streaming/video-container/WifiIndicator";
import useAgoraRtc from "components/custom-hook/useAgoraRtc";
import useAgoraRtm from "components/custom-hook/useAgoraRtm";
import StreamPublishingModal from "components/views/streaming/modal/StreamPublishingModal";
import StreamStoppedOverlay from "./overlay/StreamStoppedOverlay";
import useHandRaiseState from "components/custom-hook/useHandRaiseState";

const useStyles = makeStyles((theme) => ({
   waitingOverlay: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor:
         theme.palette.type === "dark"
            ? theme.palette.common.black
            : theme.palette.background.paper,
      zIndex: 999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   waitingText: {
      fontSize: "1.1em",
      fontWeight: "700",
      color: theme.palette.primary.main,
      textAlign: "center",
      padding: theme.spacing(0, 3),
   },
}));

function ViewerComponent({
   currentLivestream,
   firebase,
   handRaiseActive,
   isBreakout,
   showMenu,
   streamerId,
   mobile,
}) {
   const focusModeEnabled = useSelector(
      (state) => state.stream.layout.focusModeEnabled
   );
   const spyModeEnabled = useSelector(
      (state) => state.stream.streaming.spyModeEnabled
   );
   const classes = useStyles();
   const dispatch = useDispatch();
   const [showSettings, setShowSettings] = useState(false);
   const [showScreenShareModal, setShowScreenShareModal] = useState(false);
   const [optimizationMode, setOptimizationMode] = useState("detail");
   const [
      showLocalStreamPublishingModal,
      setShowLocalStreamPublishingModal,
   ] = useState(false);
   const { updateHandRaiseRequest } = useFirebase();
   const [handRaiseState, updateRequest] = useHandRaiseState(streamerId);
   const streamRef = useStreamRef();
   const {
      query: { livestreamId },
   } = useRouter();
   const { authenticatedUser } = useAuth();
   const hasActiveRooms = useSelector((state) =>
      Boolean(
         state.firestore.ordered?.[`Active BreakoutRooms of ${livestreamId}`]
            ?.length
      )
   );

   const {
      networkQuality,
      localStream,
      localMediaControls,
      remoteStreams,
      localMediaEnabling,
      publishLocalStreamTracks,
   } = useAgoraRtc(streamerId, currentLivestream.id, handRaiseActive);

   const { agoraHandlers, createEmote } = useAgoraRtm(
      currentLivestream.id,
      streamerId
   );

   const devices = useDevices(localStream);
   // console.log("-> agoraRtcStatus.msg", agoraRtcStatus.msg);
   // console.log("-> devices from use devices", devices);

   const {
      mediaControls,
      localMediaStream: displayableMediaStream,
   } = useMediaSources(
      devices,
      localStream,
      (showLocalStreamPublishingModal || showSettings) &&
         localStream?.audioTrack,
      true
   );

   const currentSpeakerId = useCurrentSpeaker(localStream, remoteStreams);

   useEffect(() => {
      if (handRaiseActive) {
         setShowLocalStreamPublishingModal(true);
      }
   }, [handRaiseActive]);

   useEffect(() => {
      if (!isBreakout && !remoteStreams?.length && hasActiveRooms) {
         const timout = setTimeout(function () {
            //Start the timer
            dispatch(actions.openViewerBreakoutModal());
         }, 3000); // Only open modal If no streams appear after 3 seconds

         return () => clearTimeout(timout); // Cancel opening modal if streams appear before 3 seconds
      }
   }, [Boolean(remoteStreams?.length), isBreakout, hasActiveRooms]);

   useEffect(() => {
      if (
         handRaiseActive &&
         handRaiseState &&
         handRaiseState.state === "connecting"
      ) {
         handleJoinAsHandRaiser();
      }
   }, [handRaiseState]);

   useEffect(() => {
      if (
         !handRaiseActive ||
         (handRaiseState &&
            (handRaiseState.state === "unrequested" ||
               handRaiseState.state === "denied"))
      ) {
         handleLeaveAsHandRaiser();
      }
   }, [handRaiseActive, handRaiseState]);

   const updateHandRaiseState = (newState) => {
      if (currentLivestream) {
         if (currentLivestream.test || currentLivestream.openStream) {
            return updateHandRaiseRequest(
               streamRef,
               "anonymous" + streamerId,
               newState
            );
         } else {
            return updateHandRaiseRequest(
               streamRef,
               authenticatedUser.email,
               newState
            );
         }
      }
   };

   const setDesktopMode = async (mode, initiatorId) => {
      let screenSharerId =
         mode === "desktop" ? initiatorId : currentLivestream.screenSharerId;
      await firebase.setDesktopMode(streamRef, mode, screenSharerId);
   };

   const shareDesktopOrSlides = () =>
      currentLivestream.mode === "presentation" ||
      currentLivestream.mode === "desktop";

   const handleCloseScreenShareModal = useCallback(() => {
      setShowScreenShareModal(false);
   }, []);

   const handleClickScreenShareButton = async () => {
      if (currentLivestream.mode === "desktop") {
         return await setDesktopMode("default", authenticatedUser.email);
      }
      setShowScreenShareModal(true);
   };

   const handleScreenShare = useCallback(
      async (optimizationMode = "detail") => {
         setOptimizationMode(optimizationMode);
         await setDesktopMode(
            currentLivestream.mode === "desktop" ? "default" : "desktop",
            authenticatedUser.email
         );
      },
      [currentLivestream?.mode, optimizationMode, streamerId]
   );

   const requestHandRaise = async () => {
      await updateHandRaiseRequest(
         streamRef,
         authenticatedUser.email,
         "requested"
      );
      setShowLocalStreamPublishingModal(false);
   };

   const handleJoinAsHandRaiser = async () => {
      if (localStream.audioTrack && !localStream.isAudioPublished) {
         await publishLocalStreamTracks.publishLocalMicrophoneTrack();
      }
      if (localStream.videoTrack && !localStream.isVideoPublished) {
         await publishLocalStreamTracks.publishLocalCameraTrack();
      }
      await updateHandRaiseState("connected");
      await dispatch(actions.setStreamerIsPublished(true));
   };

   const handleLeaveAsHandRaiser = async () => {
      if (localStream.audioTrack && localStream.isAudioPublished) {
         await localMediaEnabling.closeLocalMicrophoneTrack();
      }
      if (localStream.videoTrack && localStream.isVideoPublished) {
         await localMediaEnabling.closeLocalCameraTrack();
      }
      await publishLocalStreamTracks.returnToAudience();
      await dispatch(actions.setStreamerIsPublished(false));
   };

   const handleJoinAsViewer = async () => {
      await localMediaEnabling.closeLocalCameraTrack();
      await localMediaEnabling.closeLocalMicrophoneTrack();
      await dispatch(actions.setStreamerIsPublished(false));
      await updateHandRaiseState("unrequested");
      setShowLocalStreamPublishingModal(false);
   };

   if (!currentLivestream) {
      return null;
   }

   return (
      <React.Fragment>
         {!Boolean(mobile && handRaiseActive) && !focusModeEnabled && (
            <EmoteButtons createEmote={createEmote} />
         )}
         <Streams
            externalMediaStreams={remoteStreams}
            localMediaStream={localStream}
            currentSpeakerId={currentSpeakerId}
            streamerId={streamerId}
            mobile={mobile}
            handRaiseActive={currentLivestream.handRaiseActive}
            videoMutedBackgroundImg={currentLivestream.companyLogoUrl}
            liveSpeakers={currentLivestream.liveSpeakers}
            isBroadCasting={handRaiseActive}
            openStream={currentLivestream.openStream}
            sharingScreen={currentLivestream.mode === "desktop"}
            sharingPdf={currentLivestream.mode === "presentation"}
            showMenu={showMenu}
            livestreamId={currentLivestream.id}
         />
         <StreamPublishingModal
            open={showLocalStreamPublishingModal}
            setOpen={setShowLocalStreamPublishingModal}
            localStream={localStream}
            displayableMediaStream={displayableMediaStream}
            devices={devices}
            mediaControls={mediaControls}
            onConfirmStream={requestHandRaise}
            onRefuseStream={handleJoinAsViewer}
            localMediaEnabling={localMediaEnabling}
            labels={{
               mainTitle: "Activate Your Devices To Join The Stream",
               refuseTooltip: "Cancel Hand Raise",
               refuseLabel: "Cancel",
               joinWithoutCameraLabel: "Join without camera",
               joinWithoutCameraTooltip:
                  "We recommend to activate your camera for a better experience.",
               joinButtonLabel: "Confirm Hand Raise",
               disabledJoinButtonLabel: "Activate Microphone to Join",
            }}
         />
         {handRaiseActive && (
            <Fragment>
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
                     agoraRtmStatus={{}}
                  />
               </DraggableComponent>
               <VideoControlsContainer
                  currentLivestream={currentLivestream}
                  handleClickScreenShareButton={handleClickScreenShareButton}
                  streamerId={streamerId}
                  isMainStreamer={false}
                  localStreamIsPublished={{
                     audio: localStream?.isAudioPublished,
                     video: localStream?.isVideoPublished,
                  }}
                  openPublishingModal={() =>
                     setShowLocalStreamPublishingModal(true)
                  }
                  viewer={true}
                  localMediaControls={localMediaControls}
                  showSettings={showSettings}
                  setShowSettings={setShowSettings}
               />

               <SettingsModal
                  open={showSettings}
                  close={() => setShowSettings(false)}
                  devices={devices}
                  displayableMediaStream={displayableMediaStream}
                  mediaControls={mediaControls}
               />
               <ScreenShareModal
                  open={showScreenShareModal}
                  handleClose={handleCloseScreenShareModal}
                  handleScreenShare={handleScreenShare}
               />
               {/* <LoadingModal agoraRtcStatus={agoraRtcStatus} /> */}
               {/* <ErrorModal
                  agoraRtcStatus={agoraRtcStatus}
                  agoraRtmStatus={agoraRtmStatus}
                  agoraRtcConnectionStatus={agoraRtcConnectionStatus}
               /> */}
            </Fragment>
         )}

         {!currentLivestream.hasStarted &&
            !spyModeEnabled &&
            (currentLivestream.test ? (
               <div className={classes.waitingOverlay}>
                  <Typography className={classes.waitingText}>
                     "The streamer has to press Start Streaming to be visible to
                     students"
                  </Typography>
               </div>
            ) : (
               <StreamStoppedOverlay />
            ))}
      </React.Fragment>
   );
}

export default withFirebasePage(ViewerComponent);
