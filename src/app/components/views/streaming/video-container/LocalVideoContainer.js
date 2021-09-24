import { Tooltip } from "@material-ui/core";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import React, { useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SpeakerInfoOverlay from "./SpeakerInfoOverlay";
import VolumeOffIcon from "@material-ui/icons/MicOff";

const mutedOverlayZIndex = 9901;
const useStyles = makeStyles((theme) => ({
   companyIcon: {
      maxWidth: "75%",
      margin: "10px",
   },
   videoContainer: {
      position: "relative",
      backgroundColor: "black",
      width: "100%",
      height: "10vh",
      margin: "0 auto",
   },
   mutedOverlay: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "white",
      zIndex: mutedOverlayZIndex,
   },
   audioMuted: {
      position: "absolute",
      bottom: 10,
      right: 10,
      zIndex: mutedOverlayZIndex + 1,
   },
   mutedOverlayContent: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
   },
   videoWrapper: {
      "& video": {
         position: "absolute",
         top: "50%",
         left: "50%",
         transform: "translate(-50%, -50%)",
         maxHeight: "100%",
         maxWidth: "100%",
         // zIndex: 9900,
         backgroundColor: "black",
      },
   },
   localVideoContainer: {
      position: "relative",
      backgroundColor: "black",
      width: "100%",
      margin: "0 auto",
      zIndex: 2000,
      "& video": {
         // objectFit: "contain !important",
      },
   },
   svgShadow: {
      filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`,
   },
}));

const LocalVideoContainer = ({
   currentLivestream,
   height,
   localSpeaker,
   localStream,
   small,

}) => {
   const classes = useStyles();

   useEffect(() => {
   }, [localStream]);

   return (
      <div className={classes.localVideoContainer} style={{ height: height }}>
         <div id="localVideo" style={{ width: "100%", height: "100%" }} />
         {localSpeaker && (
            <SpeakerInfoOverlay
               zIndex={mutedOverlayZIndex + 1}
               speaker={localSpeaker}
               small={small}
            />
         )}
         {localStream?.videoMuted && (
            <div className={classes.mutedOverlay}>
               <div className={classes.mutedOverlayContent}>
                  <div>
                     <img
                        src={currentLivestream.companyLogoUrl}
                        className={classes.companyIcon}
                     />
                  </div>
                  <Tooltip title={"The streamer has turned the camera off"}>
                     <VideocamOffIcon
                        className={classes.svgShadow}
                        fontSize="large"
                        color="error"
                     />
                  </Tooltip>
               </div>
            </div>
         )}
         {localStream?.audioMuted && (
            <div className={classes.audioMuted}>
               <Tooltip title={"The streamer has muted his microphone"}>
                  <VolumeOffIcon
                     className={classes.svgShadow}
                     fontSize="large"
                     color="error"
                  />
               </Tooltip>
            </div>
         )}
      </div>
   );
};

export default LocalVideoContainer;
