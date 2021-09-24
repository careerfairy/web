import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SpeakerInfoOverlay from "../../SpeakerInfoOverlay";
import { Tooltip } from "@material-ui/core";
import VideoCamOffIcon from "@material-ui/icons/VideocamOff";
import VolumeOffIcon from "@material-ui/icons/MicOff";
import { STREAM_ELEMENT_BORDER_RADIUS } from "constants/streams";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
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


   const dispatch = useDispatch();

   const setAVideoIsMuted = () => dispatch(actions.setVideoIsMuted());
   useEffect(() => {
      if (stream.streamId === "demoStream") {
         generateDemoHandRaiser();
      } else {
         if (stream?.stream?.isPlaying() === false) {
            play(stream, stream.isLocal);
         }
      }
      return () => {
         stream?.stream?.stop();
      };
   }, [stream?.stream, stream?.stream?.isPlaying(), stream.isLocal]);

   const generateDemoHandRaiser = useCallback(() => {
      let video = document.createElement("video");
      const videoContainer = document.querySelector("#" + stream.streamId);
      videoContainer.appendChild(video);
      video.src = stream.url;
      video.loop = true;
      video.play();
   }, [stream.url]);

   const play = (stream, isLocal) => {
      stream?.stream?.play(
         stream.streamId,
         {
            fit: stream.isScreenShareVideo ? "contain" : "cover",
         },
         (err) => {
            if (err && !isLocal) {
               setAVideoIsMuted();
            }
         }
      );
   };

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
