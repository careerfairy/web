import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import SpeakerInfoOverlay from "../../SpeakerInfoOverlay";
import { Tooltip } from "@material-ui/core";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import VolumeOffIcon from "@material-ui/icons/MicOff";

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.common.black,
      borderRadius: 10,
      display: "flex",
      flex: 1,
      position: "relative",
   },
   videoElement: {
      width: "100%",
      height: "100%",
      position: "absolute",
      "& > *": {
         borderRadius: 10,
         boxShadow: theme.shadows[5],
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

const StreamItem = ({
   stream,
   big,
   speaker,
   videoMutedBackgroundImg,
}) => {
   const classes = useStyles();
   const vidDiv = useRef(null);

   useEffect(() => {
      if (!stream?.stream?.isPlaying()) {
         stream?.stream?.play(stream.streamId, {
            fit: stream.isScreenShareVideo ? "contain" : "cover",
         });
      }
      return () => {
         stream?.stream?.stop();
      };
   }, [stream?.stream]);

   return (
      <div className={classes.root}>
         <div
            id={stream.streamId}
            className={classes.videoElement}
            ref={vidDiv}
         />
         {speaker && <SpeakerInfoOverlay speaker={speaker} small={!big} />}
         {stream?.videoMuted && (
            <div className={classes.mutedOverlay}>
               <div className={classes.mutedOverlayContent}>
                  <div>
                     <img
                        src={videoMutedBackgroundImg}
                        alt={speaker.firstName || "Streamer"}
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
   stream: PropTypes.shape({
      isScreenShare: PropTypes.bool,
      isLocal: PropTypes.bool,
      audioMuted: PropTypes.bool,
      fallbackToAudio: PropTypes.bool,
      streamId: PropTypes.string,
      streamQuality: PropTypes.oneOf(["high"]),
      videoMuted: PropTypes.bool,
      stream: PropTypes.shape({
         play: PropTypes.func,
         isPlaying: PropTypes.func,
      }),
   }),
};
