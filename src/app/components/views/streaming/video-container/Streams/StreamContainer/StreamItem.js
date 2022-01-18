import PropTypes from "prop-types";
import React, { useRef } from "react";
import makeStyles from '@mui/styles/makeStyles';
import SpeakerInfoOverlay from "../../SpeakerInfoOverlay";
import { Tooltip } from "@mui/material";
import VideoCamOffIcon from "@mui/icons-material/VideocamOff";
import VolumeOffIcon from "@mui/icons-material/MicOff";
import { STREAM_ELEMENT_BORDER_RADIUS } from "constants/streams";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.common.black,
      borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
      display: "flex",
      flex: 1,
      position: "relative",
   },
   videoElement: {
      width: "100%",
      height: "100%",
      position: "absolute",
      "& > *": {
         borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
         boxShadow: theme.shadows[5],
      },
   },
   demoVideo: {
      "& > *": {
         width: "100%",
         height: "100%",
      },
   },
   svgShadow: {
      filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`,
   },
   companyIcon: {
      maxWidth: "75%",
      margin: "10px",
   },
   mutedOverlay: {
      borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "white",
      // zIndex: mutedOverlayZIndex,
   },
   mutedOverlayContent: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
   },
   audioMuted: {
      position: "absolute",
      bottom: 10,
      right: 10,
      // zIndex: mutedOverlayZIndex + 1,
   },
}));

const StreamItem = ({ stream, big, speaker, videoMutedBackgroundImg }) => {
   const classes = useStyles({ big, streamId: stream.streamId });
   const vidDiv = useRef(null);
   return (
      <div className={classes.root}>
         <div
            id={stream.streamId}
            className={clsx(classes.videoElement, {
               [classes.demoVideo]: stream.streamId === "demoStream",
            })}
            ref={vidDiv}
         />
         {speaker && (
            <SpeakerInfoOverlay speaker={speaker} zIndex={1} small={!big} />
         )}
         {stream?.videoMuted && (
            <div className={classes.mutedOverlay}>
               <div className={classes.mutedOverlayContent}>
                  <div>
                     {videoMutedBackgroundImg && (
                        <img
                           src={videoMutedBackgroundImg}
                           alt={speaker?.firstName || "Streamer"}
                           className={classes.companyIcon}
                        />
                     )}
                  </div>
                  <Tooltip title={"The streamer has turned the camera off"}>
                     <VideoCamOffIcon
                        className={classes.svgShadow}
                        fontSize="large"
                        color="error"
                     />
                  </Tooltip>
               </div>
            </div>
         )}
         {stream?.audioMuted && (
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

export default StreamItem;

StreamItem.propTypes = {
   big: PropTypes.any,
   videoId: PropTypes.string,
   speaker: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      position: PropTypes.string,
   }),
   stream: PropTypes.shape({
      isScreenShare: PropTypes.bool,
      isLocal: PropTypes.bool,
      audioMuted: PropTypes.bool,
      fallbackToAudio: PropTypes.bool,
      streamId: PropTypes.string,
      streamQuality: PropTypes.oneOf(["high", "low"]),
      videoMuted: PropTypes.bool,
      stream: PropTypes.shape({
         play: PropTypes.func,
         isPlaying: PropTypes.func,
      }),
   }),
   videoMutedBackgroundImg: PropTypes.string,
};
