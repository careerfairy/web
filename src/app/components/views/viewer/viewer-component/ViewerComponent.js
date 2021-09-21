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
                            mobile
                         }) {
   const classes = useStyles();
   const dispatch = useDispatch();
   const [showSettings, setShowSettings] = useState(false);
   const [showScreenShareModal, setShowScreenShareModal] = useState(false);
   const [optimizationMode, setOptimizationMode] = useState("detail");
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
      externalMediaStreams,
      localMediaStream,
      setLocalMediaStream,
      agoraRtcStatus,
      agoraRtmStatus,
      agoraRtcConnectionStatus,
      createEmote,
      joinedChannel,
   } = useAgoraAsStreamer(
      streamerReady,
      !handRaiseActive,
      screenSharingMode,
     currentLivestream.id,
      streamerId,
      true
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
      authenticatedUser?.email,
      localMediaStream,
      !streamerReady || showSettings
   );

   useEffect(() => {
      if (
         handRaiseActive &&
         agoraRtcStatus &&
         agoraRtcStatus.msg === "RTC_STREAM_PUBLISHED"
      ) {
         if (currentLivestream) {
            if (currentLivestream.test) {
               firebase.updateHandRaiseRequest(
                  streamRef,
                  "streamerEmail",
                  "connected"
               );
            } else {
               firebase.updateHandRaiseRequest(
                  streamRef,
                  authenticatedUser.email,
                  "connected"
               );
            }
         }
      }
   }, [agoraRtcStatus]);

   const currentSpeakerId = useCurrentSpeaker(
      localMediaStream,
      externalMediaStreams
   );

   useEffect(() => {
      if (
         joinedChannel &&
         !isBreakout &&
         !externalMediaStreams?.length &&
         hasActiveRooms
      ) {
         const timout = setTimeout(function () {
            //Start the timer
            dispatch(actions.openViewerBreakoutModal());
         }, 3000); // Only open modal If no streams appear after 3 seconds

         return () => clearTimeout(timout); // Cancel opening modal if streams appear before 3 seconds
      }
   }, [
      Boolean(externalMediaStreams?.length),
      isBreakout,
      hasActiveRooms,
      joinedChannel,
   ]);

   const setDesktopMode = async (mode, initiatorId) => {
      let screenSharerId =
         mode === "desktop"
            ? initiatorId
            : currentLivestream.screenSharerId;
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

   if (!currentLivestream) {
      return null;
   }
   return (
      <React.Fragment>
         {!Boolean(mobile && handRaiseActive) && <EmoteButtons createEmote={createEmote} />}
         <Streams
            externalMediaStreams={externalMediaStreams}
            localMediaStream={localMediaStream}
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
               <VideoControlsContainer
                  currentLivestream={currentLivestream}
                  viewer={true}
                  streamerId={authenticatedUser.email}
                  joining={true}
                  localMediaStream={localMediaStream}
                  setLocalMediaStream={setLocalMediaStream}
                  handleClickScreenShareButton={handleClickScreenShareButton}
                  isMainStreamer={false}
                  showSettings={showSettings}
                  setShowSettings={setShowSettings}
               />
               <SettingsModal
                  open={showSettings}
                  close={() => setShowSettings(false)}
                  streamId={authenticatedUser.email}
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
               <ScreenShareModal
                  open={showScreenShareModal}
                  handleClose={handleCloseScreenShareModal}
                  handleScreenShare={handleScreenShare}
               />
               <LoadingModal agoraRtcStatus={agoraRtcStatus} />
               <ErrorModal
                  agoraRtcStatus={agoraRtcStatus}
                  agoraRtmStatus={agoraRtmStatus}
                  agoraRtcConnectionStatus={agoraRtcConnectionStatus}
               />
            </Fragment>
         )}

         {!currentLivestream.hasStarted && (
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
