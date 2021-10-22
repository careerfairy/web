import React, { Fragment, useCallback, useEffect, useState } from "react";
import { withFirebasePage } from "context/firebase";
import useAgoraAsStreamer from "components/custom-hook/useAgoraAsStreamer";
import useDevices from "components/custom-hook/useDevices";
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
   ] = useState(true);
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
   const streamerReady = true;

   const screenSharingMode =
      currentLivestream.screenSharerId === authenticatedUser?.email &&
      currentLivestream.mode === "desktop"
         ? optimizationMode
         : "";

   const {
      networkQuality,
      localStream,
      localMediaControls,
      remoteStreams,
      localMediaEnabling,
      publishLocalCameraStream,
      publishScreenShareStream,
      unpublishScreenShareStream,
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
      if (!isBreakout && !remoteStreams?.length && hasActiveRooms) {
         const timout = setTimeout(function () {
            //Start the timer
            dispatch(actions.openViewerBreakoutModal());
         }, 3000); // Only open modal If no streams appear after 3 seconds

         return () => clearTimeout(timout); // Cancel opening modal if streams appear before 3 seconds
      }
   }, [Boolean(remoteStreams?.length), isBreakout, hasActiveRooms]);

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

   const handlePublishLocalStream = async () => {
      if (localStream.audioTrack && !localStream.isAudioPublished) {
         await publishLocalStreamTracks.publishLocalMicrophoneTrack();
      }
      if (localStream.videoTrack && !localStream.isVideoPublished) {
         await publishLocalStreamTracks.publishLocalCameraTrack();
      }
      await dispatch(actions.setStreamerIsPublished(true));
      setShowLocalStreamPublishingModal(false);
   };

   const handleJoinAsViewer = async () => {
      await localMediaEnabling.closeLocalCameraTrack();
      await localMediaEnabling.closeLocalMicrophoneTrack();
      await dispatch(actions.setStreamerIsPublished(false));
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
            sharingScreen={currentLivestream.mode === "desktop"}
            sharingPdf={currentLivestream.mode === "presentation"}
            showMenu={showMenu}
            livestreamId={currentLivestream.id}
         />
         {handRaiseActive && (
            <Fragment>
               <StreamPublishingModal
                  open={showLocalStreamPublishingModal}
                  setOpen={setShowLocalStreamPublishingModal}
                  localStream={localStream}
                  displayableMediaStream={displayableMediaStream}
                  devices={devices}
                  mediaControls={mediaControls}
                  onConfirmStream={handlePublishLocalStream}
                  onRefuseStream={handleJoinAsViewer}
                  localMediaEnabling={localMediaEnabling}
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

         {!currentLivestream.hasStarted && !spyModeEnabled && (
            <div className={classes.waitingOverlay}>
               <Typography className={classes.waitingText}>
                  {currentLivestream.test
                     ? "The streamer has to press Start Streaming to be visible to students"
                     : "Thank you for joining!"}
               </Typography>
            </div>
         )}
      </React.Fragment>
   );
}

export default withFirebasePage(ViewerComponent);
