import React, {
   Fragment,
   useCallback,
   useContext,
   useEffect,
   useState,
} from "react";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import useDevices from "components/custom-hook/useDevices";
import useMediaSources from "components/custom-hook/useMediaSources";
import VideoControlsContainer from "components/views/streaming/video-container/VideoControlsContainer";
import { useAuth } from "HOCs/AuthProvider";
import makeStyles from "@mui/styles/makeStyles";
import SettingsModal from "../../streaming/video-container/SettingsModal";
import { Typography } from "@mui/material";
import ScreenShareModal from "../../streaming/video-container/ScreenShareModal";
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
import StreamPublishingModal from "components/views/streaming/modal/StreamPublishingModal";
import StreamStoppedOverlay from "./overlay/StreamStoppedOverlay";
import useHandRaiseState from "components/custom-hook/useHandRaiseState";
import RecommendedEventsOverlay from "./overlay/RecommendedEventsOverlay";
import AgoraRTMContext from "../../../../context/agoraRTM/AgoraRTMContext";
import AgoraStateHandler from "../../streaming/modal/AgoraStateModal/AgoraStateHandler";

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
   handRaiseActive,
   isBreakout,
   showMenu,
   streamerId,
   mobile,
}) {
   const {
      setDesktopMode: setDesktopModeInstanceMethod,
   } = useFirebaseService();
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
   const [handRaiseState, updateRequest, hasRoom] = useHandRaiseState(
      streamerId
   );

   const streamRef = useStreamRef();
   const {
      query: { livestreamId },
   } = useRouter();

   const { authenticatedUser, userData } = useAuth();
   const hasActiveRooms = useSelector((state) =>
      Boolean(
         state.firestore.ordered?.[`Active BreakoutRooms of ${livestreamId}`]
            ?.length
      )
   );

   const shouldInitializeAgora = Boolean(
      currentLivestream.hasStarted || (userData?.isAdmin && spyModeEnabled)
   );
   const {
      networkQuality,
      localStream,
      localMediaControls,
      remoteStreams,
      localMediaHandlers,
      publishLocalStreamTracks,
   } = useAgoraRtc(
      streamerId,
      currentLivestream.id,
      handRaiseActive,
      shouldInitializeAgora,
      { isAHandRaiser: handRaiseActive }
   );

   const { createEmote } = useContext(AgoraRTMContext);

   const devices = useDevices(localStream, {
      initialize: Boolean(handRaiseActive),
   });

   const {
      mediaControls,
      localMediaStream: displayableMediaStream,
   } = useMediaSources(devices, localStream, true);

   const currentSpeakerId = useCurrentSpeaker(localStream, remoteStreams);

   useEffect(() => {
      setShowLocalStreamPublishingModal(Boolean(handRaiseActive));
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
         handRaiseState.state === "connecting" &&
         // Make sure not to auto invite if the viewer is still in the publishing modal
         !showLocalStreamPublishingModal
      ) {
         handleJoinAsHandRaiser();
      }
   }, [handRaiseState, showLocalStreamPublishingModal]);

   useEffect(() => {
      if (handRaiseState?.state === "requested") {
      }
   }, []);

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

   const setDesktopMode = async (mode, initiatorId) => {
      let screenSharerId =
         mode === "desktop" ? initiatorId : currentLivestream.screenSharerId;
      await setDesktopModeInstanceMethod(streamRef, mode, screenSharerId);
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
      try {
         if (
            // If you were previously connected
            handRaiseState?.state === "connected" &&
            // and there is still room
            hasRoom
         ) {
            // go straight to the connecting phase
            await updateRequest("connecting");
         } else if (handRaiseState.state === "connecting") {
            // After being in a connecting state for god knows how long, you finally clicked join.
            if (hasRoom) {
               // At the time of clicking join there is still room, so you can join in the stream as a HR
               await handleJoinAsHandRaiser();
            } else {
               //  At the time of clicking join there is no more room, which means you
               //  have to go back into the queue as a HR
               await updateRequest("requested");
               dispatch(actions.enqueueSuccessfulHandRaiseRequest());
            }
         } else {
            await updateRequest("requested");
            dispatch(actions.enqueueSuccessfulHandRaiseRequest());
         }
      } catch (e) {
         console.log("-> e", e);
      }
      setShowLocalStreamPublishingModal(false);
   };

   const handleJoinAsHandRaiser = async () => {
      if (localStream.audioTrack && !localStream.isAudioPublished) {
         await publishLocalStreamTracks.publishLocalMicrophoneTrack();
      }
      if (localStream.videoTrack && !localStream.isVideoPublished) {
         await publishLocalStreamTracks.publishLocalCameraTrack();
      }
      await updateRequest("connected");
      await dispatch(actions.setStreamerIsPublished(true));
   };

   const handleLeaveAsHandRaiser = async () => {
      if (localStream.audioTrack && localStream.isAudioPublished) {
         await localMediaHandlers.closeLocalMicrophoneTrack();
      }
      if (localStream.videoTrack && localStream.isVideoPublished) {
         await localMediaHandlers.closeLocalCameraTrack();
      }
      await publishLocalStreamTracks.returnToAudience();
      await dispatch(actions.setStreamerIsPublished(false));
   };

   const handleJoinAsViewer = async () => {
      await localMediaHandlers.closeLocalCameraTrack();
      await localMediaHandlers.closeLocalMicrophoneTrack();
      await dispatch(actions.setStreamerIsPublished(false));
      await updateRequest("unrequested");
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
         <AgoraStateHandler />
         <StreamPublishingModal
            open={showLocalStreamPublishingModal}
            setOpen={setShowLocalStreamPublishingModal}
            showSoundMeter={Boolean(
               (showLocalStreamPublishingModal || showSettings) &&
                  localStream?.audioTrack
            )}
            localStream={localStream}
            displayableMediaStream={displayableMediaStream}
            devices={devices}
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
                     videoEnabled: Boolean(localStream.videoTrack?.enabled),
                     audioEnabled: Boolean(localStream.audioTrack?.enabled),
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
                  localStream={localStream}
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
            ) : currentLivestream.recommendedEventIds?.length ? (
               <RecommendedEventsOverlay
                  recommendedEventIds={currentLivestream.recommendedEventIds}
                  mobile={mobile}
               />
            ) : (
               <StreamStoppedOverlay />
            ))}
      </React.Fragment>
   );
}

export default ViewerComponent;
