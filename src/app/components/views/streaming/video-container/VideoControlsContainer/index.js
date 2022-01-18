import React, {
   useCallback,
   useContext,
   useEffect,
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
import { withFirebasePage } from "context/firebase";
import { alpha, useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import { ClickAwayListener } from "@mui/material";
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
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
      backgroundColor: theme.palette.primary.main,
      color: "white",
      "&:disabled": {
         backgroundColor: alpha(theme.palette.primary.main, 0.5),
         color: "white",
      },
      "&:hover": {
         backgroundColor: theme.palette.primary.dark,
      },
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
   localMediaStream,
   setLocalMediaStream,
}) {
   const shareButtonRef = useRef();
   const streamRef = useStreamRef();
   const { tutorialSteps, setTutorialSteps } = useContext(TutorialContext);
   const theme = useTheme();
   const DELAY = 3000; //3 seconds
   const [open, setOpen] = useState(true);
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

   function toggleMicrophone() {
      if (isLocalMicMuted) {
         localMediaStream.stream.unmuteAudio();
         let localMediaStreamCopy = { ...localMediaStream };
         localMediaStreamCopy.audioMuted = false;
         setLocalMediaStream(localMediaStreamCopy);
      } else {
         localMediaStream.stream.muteAudio();
         let localMediaStreamCopy = { ...localMediaStream };
         localMediaStreamCopy.audioMuted = true;
         setLocalMediaStream(localMediaStreamCopy);
      }
      setIsLocalMicMuted(!isLocalMicMuted);
   }

   function toggleVideo() {
      if (isVideoInactive) {
         localMediaStream.stream.unmuteVideo();
         let localMediaStreamCopy = { ...localMediaStream };
         localMediaStreamCopy.videoMuted = false;
         setLocalMediaStream(localMediaStreamCopy);
      } else {
         localMediaStream.stream.muteVideo();
         let localMediaStreamCopy = { ...localMediaStream };
         localMediaStreamCopy.videoMuted = true;
         setLocalMediaStream(localMediaStreamCopy);
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

   const actions = [
      {
         icon: isLocalMicMuted ? (
            <MicOffIcon fontSize="large" style={{ color: "red" }} />
         ) : (
            <MicIcon fontSize="large" color="primary" />
         ),
         name: isLocalMicMuted ? "Unmute microphone" : "Mute microphone",
         onClick: toggleMicrophone,
      },
      {
         icon: isVideoInactive ? (
            <VideocamOffIcon fontSize="large" style={{ color: "red" }} />
         ) : (
            <VideocamIcon fontSize="large" color="primary" />
         ),
         name: isVideoInactive ? "Switch camera on" : "Switch camera off",
         onClick: toggleVideo,
      },
   ];

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
         icon: <ShareIcon />,
         name: "Share",
         onClick: handleClickShare,
      });
   }

   actions.unshift({
      icon: <SettingsIcon fontSize="large" />,
      name: "Settings",
      onClick: () => setShowSettings(!showSettings),
   });

   return (
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
                              classes={{ staticTooltipLabel: classes.tooltip }}
                              tooltipOpen={Boolean(action.name.length)}
                              FabProps={{
                                 size: "large",
                                 // classes: {root:  classes.actionButton},
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
   );
}

VideoControlsContainer.prototypes = {
   currentLivestream: PropTypes.object.isRequired,
   viewer: PropTypes.bool,
   setShowSettings: PropTypes.func.isRequired,
   streamerId: PropTypes.string,
   handleClickScreenShareButton: PropTypes.func,
   isMainStreamer: PropTypes.bool,
   localMediaStream: PropTypes.object,
   showSettings: PropTypes.bool,
   joining: PropTypes.bool,
};

export default withFirebasePage(VideoControlsContainer);
