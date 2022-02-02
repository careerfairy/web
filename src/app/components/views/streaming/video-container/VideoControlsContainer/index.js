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
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import SettingsIcon from "@mui/icons-material/Settings";
import { withFirebasePage } from "context/firebase/FirebaseServiceContext";
import { alpha, useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { ClickAwayListener } from "@mui/material";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import TutorialContext from "context/tutorials/TutorialContext";
import {
   StyledTooltipWithButton,
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "materialUI/GlobalTooltips";
import PropTypes from "prop-types";
import useStreamRef from "components/custom-hook/useStreamRef";
import { CallToActionIcon, ShareIcon, SharePdfIcon } from "./Icons";
import ShareMenu from "./ShareMenu";
import CallToActionDrawer from "./CallToActionDrawer";
import useSliderFullyOpened from "../../../../custom-hook/useSliderFullyOpened";
import NewFeatureHint from "../../../../util/NewFeatureHint";

const useStyles = makeStyles((theme) => ({
   root: {
      position: "absolute",
      right: 0,
      top: 0,
      height: "50%",
      transform: "translateY(50%)",
      width: 120,
      padding: 30,
      backgroundColor: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      zIndex: 2,
   },
   speedDial: {
      transition: "transform 0.2s",
      transitionTimingFunction: theme.transitions.easeInOut,
      transform: ({ open }) =>
         open ? "" : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-moz-transform": ({ open }) =>
         open ? "" : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-o-transform": ({ open }) =>
         open ? "" : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-webkit-transform": ({ open }) =>
         open ? "" : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
   },
   actionButton: {
      width: 40,
      height: 40,
      // color: "white",
      // "&:disabled": {
      //    backgroundColor: alpha(theme.palette.primary.main, 0.5),
      //    color: "white",
      // },
      // "&:hover": {
      //    backgroundColor: theme.palette.primary.dark,
      // },
   },
   cardHovered: {},
   tooltip: {
      transition: "all 0.8s",
      transitionTimingFunction: theme.transitions.easeInOut,
      display: ({ open }) => (open ? "block" : "none"),
      whiteSpace: "nowrap",
   },
   dialButton: {
      display: "none",
   },
}));
const VIEWER_VIDEO_CONTROLS_HINT_LOCAL_KEY = "hasSeenVideoControlsAsViewer";

function VideoControlsContainer({
   currentLivestream: { mode, id, speakerSwitchMode, screenSharerId, test },
   viewer,
   setShowSettings,
   showSettings,
   firebase,
   streamerId,
   handleClickScreenShareButton,
   isMainStreamer,
   localStreamIsPublished,
   openPublishingModal,
   joinAsViewer,
   localMediaControls,
}) {
   const shareButtonRef = useRef();
   const streamRef = useStreamRef();
   const { tutorialSteps, setTutorialSteps } = useContext(TutorialContext);
   const theme = useTheme();
   const DELAY = 3000; //3 seconds
   const [open, setOpen] = useState(true);
   const [openModal, setOpenModal] = useState(false);
   const classes = useStyles({ open });
   const [delayHandler, setDelayHandler] = useState(null);
   const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
   const [isVideoInactive, setIsVideoInactive] = useState(false);
   const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null);
   const [callToActionDrawerOpen, setCallToActionDrawerOpen] = useState(false);
   const [fullyOpened, onEntered, onExited] = useSliderFullyOpened();
   const presentMode = mode === "presentation";
   const automaticMode = speakerSwitchMode === "automatic";
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

   const handleMouseEnter = (event) => {
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
      await joinAsViewer();
      setOpenModal(false);
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

   if (isPublishing) {
      if (localStreamIsPublished.video) {
         actions.unshift({
            icon: isVideoInactive ? (
               <VideocamOffIcon fontSize="medium" style={{ color: "red" }} />
            ) : (
               <VideocamIcon fontSize="medium" color="primary" />
            ),
            name: localCameraLabel,
            onClick: toggleVideo,
         });
      }

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
         icon: <LiveTvIcon />,
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
         icon: <ExitToAppIcon fontSize="medium" />,
         name: "Join as viewer",
         onClick: () => setOpenModal(true),
      });
   }

   return (
      <>
         <ClickAwayListener onClickAway={handleClose}>
            <div
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}
               className={classes.root}
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
                        transitionTimingFunction: theme.transitions.easeInOut,
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
                        className={classes.speedDial}
                        FabProps={{
                           onClick: handleToggle,
                           className: classes.dialButton,
                        }}
                        TransitionProps={{
                           onEntered,
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
                                 classes={{
                                    staticTooltipLabel: classes.tooltip,
                                 }}
                                 tooltipOpen={Boolean(action.name.length)}
                                 FabProps={{
                                    classes: { root: classes.actionButton },
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
            </div>
         </ClickAwayListener>
         <Dialog open={openModal} onClose={() => setModalOpen(false)}>
            <DialogTitle>Joining as viewer</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Are you sure that you want to switch off your camera and
                  microphone? You can rejoin as a streamer at any time.
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button
                  startIcon={<ClearIcon />}
                  variant="contained"
                  onClick={() => setModalOpen(false)}
               >
                  Cancel
               </Button>
               <Button
                  startIcon={<CheckIcon />}
                  variant="contained"
                  color="primary"
                  onClick={() => handleJoinAsViewer()}
               >
                  Confirm
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
}

VideoControlsContainer.prototypes = {
   currentLivestream: PropTypes.object.isRequired,
   viewer: PropTypes.bool,
   streamerId: PropTypes.string,
   handleClickScreenShareButton: PropTypes.func,
   isMainStreamer: PropTypes.bool,
   showSettings: PropTypes.bool,
   setShowSettings: PropTypes.func.isRequired,
   localMediaControls: PropTypes.object,
};

export default withFirebasePage(VideoControlsContainer);
