import React, {
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import SettingsIcon from "@mui/icons-material/Settings";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import { useTheme } from "@mui/material/styles";
import {
   Box,
   ClickAwayListener,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from "@mui/material";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import TutorialContext from "context/tutorials/TutorialContext";
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "materialUI/GlobalTooltips";
import useStreamRef from "components/custom-hook/useStreamRef";
import { CallToActionIcon, ShareIcon, SharePdfIcon } from "./Icons";
import ShareMenu from "./ShareMenu";
import CallToActionDrawer from "./CallToActionDrawer";
import useSliderFullyOpened from "../../../../custom-hook/useSliderFullyOpened";
import NewFeatureHint from "../../../../util/NewFeatureHint";
import JoinAsStreamerIcon from "@mui/icons-material/RecordVoiceOver";
import StudentViewIcon from "@mui/icons-material/FaceRounded";
import Button from "@mui/material/Button";
import CheckIcon from "@mui/icons-material/Check";
import { useDispatch } from "react-redux";
import * as storeActions from "store/actions";
import LoadingButton from "@mui/lab/LoadingButton";
import { StreamData } from "types";

const styles = {
   root: {
      position: "absolute",
      right: 0,
      top: 0,
      height: "50%",
      transform: "translateY(50%)",
      width: 120,
      padding: "30px",
      backgroundColor: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      zIndex: 2,
   },
   speedDial: {
      transition: "transform 0.2s",
      transitionTimingFunction: (theme) => theme.transitions.easeInOut,
      transform: "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-moz-transform": "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-o-transform": "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-webkit-transform": "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
   },
   speedDialOpen: {
      transform: "",
      "-moz-transform": "",
      "-o-transform": "",
      "-webkit-transform": "",
   },
   speedDialAction: {
      "& .MuiSpeedDialAction-staticTooltipLabel": {
         transition: "all 0.8s",
         transitionTimingFunction: (theme) => theme.transitions.easeInOut,
         display: "none",
         whiteSpace: "nowrap",
      },
   },

   actionButton: {
      width: 40,
      height: 40,
   },
   speedDialActionOpen: {
      "& .MuiSpeedDialAction-staticTooltipLabel": {
         display: "block",
      },
   },
   dialButton: {
      display: "none",
   },
};
const VIEWER_VIDEO_CONTROLS_HINT_LOCAL_KEY = "hasSeenVideoControlsAsViewer";
interface Props {
   currentLivestream: StreamData;
   streamerId: string;
   viewer: boolean;
   showSettings: boolean;
   setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
   handleClickScreenShareButton: () => Promise<any>;
   isMainStreamer: boolean;
   localStreamIsPublished: {
      audio?: boolean;
      video?: boolean;
   };
   joinAsViewer?: () => Promise<any>;
   localMediaControls: {
      setLocalAudioEnabled: (enabled: boolean) => void;
      setLocalVideoEnabled: (enabled: boolean) => void;
   };
   openPublishingModal: () => void;
}
const VideoControlsContainer = ({
   currentLivestream: { mode, screenSharerId, test },
   viewer,
   setShowSettings,
   showSettings,
   streamerId,
   handleClickScreenShareButton,
   isMainStreamer,
   localStreamIsPublished,
   openPublishingModal,
   joinAsViewer,
   localMediaControls,
}: Props) => {
   const firebase = useFirebaseService();
   const dispatch = useDispatch();
   const shareButtonRef = useRef();
   const streamRef = useStreamRef();
   const { tutorialSteps, setTutorialSteps } = useContext(TutorialContext);
   const theme = useTheme();
   const DELAY = 3000; //3 seconds
   const [open, setOpen] = useState(true);
   const [openModal, setOpenModal] = useState(false);
   const [delayHandler, setDelayHandler] = useState(null);
   const [joiningAsViewer, setJoiningAsViewer] = useState(false);
   const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
   const [isVideoInactive, setIsVideoInactive] = useState(false);
   const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null);
   const [callToActionDrawerOpen, setCallToActionDrawerOpen] = useState(false);
   const [fullyOpened, onEntered, onExited] = useSliderFullyOpened();
   const presentMode = mode === "presentation";
   const desktopMode = mode === "desktop";

   useEffect(() => {
      if (isOpen(16)) {
         setOpen(true);
      }
   }, [tutorialSteps]);

   const handleOpenShare = (shareButtonRef) => {
      setShareMenuAnchorEl(shareButtonRef.current);
   };

   const handleClickShare = (event) => {
      setShareMenuAnchorEl(event.currentTarget);
   };
   const handleCloseShareMenu = () => {
      setShareMenuAnchorEl(null);
   };

   const isOpen = (property) => {
      return Boolean(
         test && tutorialSteps.streamerReady && tutorialSteps[property]
      );
   };

   const handleConfirm = (property) => {
      setTutorialSteps({
         ...tutorialSteps,
         [property]: false,
         [property + 1]: true,
      });
   };

   const handleMouseEnter = () => {
      clearTimeout(delayHandler);
      handleOpen();
   };

   const handleMouseLeave = () => {
      setDelayHandler(
         setTimeout(() => {
            handleClose();
         }, DELAY)
      );
   };

   const handleOpen = () => {
      setOpen(true);
   };

   const handleToggle = () => {
      setOpen(!open);
   };

   const handleClose = () => {
      setOpen(false);
   };

   const handleOpenPublishingModal = () => {
      openPublishingModal();
   };

   const handleJoinAsViewer = async () => {
      try {
         setJoiningAsViewer(true);
         await joinAsViewer();
         setOpenModal(false);
      } catch (e) {
         dispatch(storeActions.sendGeneralError(e));
      }
      setJoiningAsViewer(false);
   };

   function toggleMicrophone() {
      if (isLocalMicMuted) {
         localMediaControls.setLocalAudioEnabled(true);
      } else {
         localMediaControls.setLocalAudioEnabled(false);
      }
      setIsLocalMicMuted(!isLocalMicMuted);
   }

   function toggleVideo() {
      const isPublishingWithoutVideo =
         isPublishing && localStreamIsPublished.video === false;

      if (isPublishingWithoutVideo) {
      }
      if (isVideoInactive) {
         localMediaControls.setLocalVideoEnabled(true);
      } else {
         localMediaControls.setLocalVideoEnabled(false);
      }
      setIsVideoInactive(!isVideoInactive);
   }

   function setLivestreamMode(mode) {
      firebase.setLivestreamMode(streamRef, mode);
   }

   const showScreenShareButtons = () => {
      if (desktopMode) {
         return isMainStreamer || streamerId === screenSharerId;
      } else {
         return true;
      }
   };

   const handleOpenCallToActionDrawer = () => {
      setCallToActionDrawerOpen(true);
   };
   const handleCloseCallToActionDrawer = useCallback(() => {
      setCallToActionDrawerOpen(false);
   }, []);

   const isPublishing = useMemo(() => {
      return localStreamIsPublished.audio || localStreamIsPublished.video;
   }, [localStreamIsPublished.audio, localStreamIsPublished.video]);

   const localMicrophoneLabel = useMemo(() => {
      if (localStreamIsPublished.audio) {
         return isLocalMicMuted ? "Unmute microphone" : "Mute microphone";
      } else {
         return "Join with audio";
      }
   }, [localStreamIsPublished.audio, isLocalMicMuted]);

   const localCameraLabel = useMemo(() => {
      if (localStreamIsPublished.video) {
         return isLocalMicMuted ? "Switch camera on" : "Switch camera off";
      } else {
         return "Join with video";
      }
   }, [localStreamIsPublished.video, isLocalMicMuted]);

   const actions = [];
   // console.log("-> isPublishing", isPublishing);
   // console.log("-> localStreamIsPublished", localStreamIsPublished);

   if (isPublishing) {
      actions.unshift({
         icon: isVideoInactive ? (
            <VideocamOffIcon fontSize="medium" style={{ color: "red" }} />
         ) : (
            <VideocamIcon fontSize="medium" color="primary" />
         ),
         name: localCameraLabel,
         onClick: toggleVideo,
      });

      if (localStreamIsPublished.audio) {
         actions.unshift({
            icon: isLocalMicMuted ? (
               <MicOffIcon fontSize="medium" style={{ color: "red" }} />
            ) : (
               <MicIcon fontSize="medium" color="primary" />
            ),
            name: localMicrophoneLabel,
            onClick: toggleMicrophone,
         });
      }
   } else if (!viewer) {
      actions.unshift({
         icon: <JoinAsStreamerIcon />,
         name: "Join as streamer",
         onClick: handleOpenPublishingModal,
      });
   }

   const shareActions = [];

   if (showScreenShareButtons()) {
      shareActions.unshift({
         icon: <ScreenShareIcon color={desktopMode ? "primary" : "inherit"} />,
         name: desktopMode ? "Stop sharing screen" : "Share screen",
         onClick: () => handleClickScreenShareButton(),
         id: "shareScreenAction",
      });
   }

   if (!viewer) {
      shareActions.unshift(
         {
            icon: (
               <SharePdfIcon
                  // fontSize="small"
                  color={presentMode ? "primary" : "inherit"}
               />
            ),
            name: presentMode
               ? "Stop Sharing PDF presentation"
               : "Share PDF presentation",
            onClick: () =>
               setLivestreamMode(presentMode ? "default" : "presentation"),
            id: "sharePdfAction",
         },
         {
            icon: <CallToActionIcon />,
            name: "Send a call to action",
            onClick: () => handleOpenCallToActionDrawer(),
            id: "sendCtaAction",
         }
      );
   }

   if (shareActions.length) {
      actions.unshift({
         icon: <ShareIcon fontSize="small" />,
         name: "Share",
         onClick: handleClickShare,
      });
   }

   actions.unshift({
      icon: <SettingsIcon fontSize="medium" />,
      name: "Settings",
      onClick: () => setShowSettings(!showSettings),
   });

   if (!viewer && isPublishing) {
      actions.unshift({
         icon: <StudentViewIcon fontSize="medium" />,
         name: "Join as viewer",
         onClick: () => setOpenModal(true),
      });
   }

   return (
      <>
         <ClickAwayListener onClickAway={handleClose}>
            <Box
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}
               sx={styles.root}
            >
               <NewFeatureHint
                  localStorageKey={VIEWER_VIDEO_CONTROLS_HINT_LOCAL_KEY}
                  tooltipTitle="Change your device settings"
                  hide={!viewer}
                  tooltipText="You can change device settings here as well as enable and disable your camera and microphone."
                  buttonText={"I understand"}
               >
                  <WhiteTooltip
                     placement="top"
                     style={{
                        transition: "transform 0.2s",
                        transitionTimingFunction:
                           theme.transitions.easing.easeInOut,
                        transform: open
                           ? ""
                           : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
                     }}
                     title={
                        <React.Fragment>
                           <TooltipTitle>Video Controls</TooltipTitle>
                           <TooltipText>
                              You can mute, share slides, promote links and job
                              postings.
                           </TooltipText>
                           <TooltipButtonComponent
                              onConfirm={() => {
                                 handleOpen();
                                 handleConfirm(16);
                                 handleOpenShare(shareButtonRef);
                              }}
                              buttonText="Ok"
                           />
                        </React.Fragment>
                     }
                     open={isOpen(16) && fullyOpened}
                  >
                     <SpeedDial
                        ariaLabel="interaction-selector"
                        sx={[styles.speedDial, open && styles.speedDialOpen]}
                        FabProps={{
                           onClick: handleToggle,
                           sx: styles.dialButton,
                        }}
                        TransitionProps={{
                           // @ts-ignore
                           onEntered,
                           // @ts-ignore
                           onExited,
                        }}
                        icon={<SpeedDialIcon />}
                        onFocus={handleOpen}
                        open
                     >
                        {actions.map((action) => {
                           return (
                              <SpeedDialAction
                                 key={action.name}
                                 ref={
                                    action.name === "Share"
                                       ? shareButtonRef
                                       : undefined
                                 }
                                 icon={action.icon}
                                 tooltipPlacement="left"
                                 tooltipTitle={action.name}
                                 sx={[
                                    styles.speedDialAction,
                                    open && styles.speedDialActionOpen,
                                 ]}
                                 tooltipOpen={Boolean(action.name.length)}
                                 FabProps={{
                                    sx: styles.actionButton,
                                 }}
                                 onClick={action.onClick}
                              />
                           );
                        })}
                     </SpeedDial>
                  </WhiteTooltip>
               </NewFeatureHint>
               <ShareMenu
                  anchorEl={shareMenuAnchorEl}
                  onClose={handleCloseShareMenu}
                  isOpen={isOpen}
                  shareActions={shareActions}
                  handleOpenCallToActionDrawer={handleOpenCallToActionDrawer}
                  handleConfirm={handleConfirm}
               />
               <CallToActionDrawer
                  isOpen={isOpen}
                  isTestStream={test}
                  handleConfirm={handleConfirm}
                  onClose={handleCloseCallToActionDrawer}
                  open={callToActionDrawerOpen}
               />
            </Box>
         </ClickAwayListener>
         <Dialog open={openModal} onClose={() => setOpenModal(false)}>
            <DialogTitle>Joining as viewer</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Are you sure that you want to switch off your camera and
                  microphone? You can rejoin as a streamer at any time.
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button
                  variant="text"
                  color="grey"
                  disabled={joiningAsViewer}
                  onClick={() => setOpenModal(false)}
               >
                  Cancel
               </Button>
               <LoadingButton
                  startIcon={<CheckIcon />}
                  variant="contained"
                  color="primary"
                  loading={joiningAsViewer}
                  onClick={() => handleJoinAsViewer()}
               >
                  {joiningAsViewer ? "Joining" : "Confirm"}
               </LoadingButton>
            </DialogActions>
         </Dialog>
      </>
   );
};

export default VideoControlsContainer;
