import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

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
      "& > *":{
      borderRadius: 10,
      }
   },
}));

const StreamItem = ({ stream, big, videoId }) => {
   const classes = useStyles();
   if(big){
   console.log("-> stream?.streamId in item", stream?.streamId);
   }
   // console.log("-> stream", stream);
   return (
      <div className={classes.root}>
         <div
            id={stream?.streamId}
            className={classes.videoElement}
         />
         ds
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
      videoMuted: PropTypes.string,
      stream: PropTypes.shape({
         play: PropTypes.func,
         isPlaying: PropTypes.func,
      }),
   }),
};
