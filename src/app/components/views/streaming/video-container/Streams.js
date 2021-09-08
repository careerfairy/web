import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      display: "flex",
   },
   videoElementsWrapper: {
      backgroundColor: "orange",
      width: "100%",
   },
}));

const Streams = ({
   externalMediaStreams,
   localMediaStream,
   currentSpeakerId,
}) => {
   const classes = useStyles();
   const [streamData, setStreamData] = useState({
      large: null,
      small: [],
   });
   console.log("-> streamData", streamData);

   useEffect(() => {
      setStreamData(({ large, small }) => {
         const allStreams = [...externalMediaStreams];
         if (localMediaStream) {
            allStreams.push(localMediaStream);
         }
         console.log("-> allStreams base", allStreams);

         let newLargeStream = handleGetLargeStream(
            allStreams,
            localMediaStream,
            currentSpeakerId
         );
         let newSmallStreams = handleGetSmallStream(allStreams, newLargeStream);

         return {
            large: newLargeStream,
            small: newSmallStreams,
         };
      });
   }, [externalMediaStreams, localMediaStream, currentSpeakerId]);

   const handleGetLargeStream = (allStreams, currentSpeakerId) => {
      let screenShareStream;
      let currentSpeakerStream;
      let localStream;
      if (allStreams.length === 1) return allStreams[0];

      for (const stream of allStreams) {
         if (stream.streamId.includes("screen")) {
            screenShareStream = stream;
            break;
         }
         if (stream.streamId === currentSpeakerId) {
            currentSpeakerStream = stream;
            break;
         }

         if (stream.isLocal) {
            localStream = stream;
         }
      }

      if (screenShareStream) return screenShareStream;

      if (currentSpeakerStream) return currentSpeakerStream;
      if (localStream) return localStream;

      if (!currentSpeakerStream && !screenShareStream && allStreams.length)
         return allStreams[0];

      return null;
   };

   const handleGetSmallStream = (allStreams, largeStream) => {
      if (!largeStream) return allStreams;
      return allStreams.filter(
         (stream) => stream.streamId !== largeStream.streamId
      );
   };

   return (
      <div className={classes.root}>
         <div className={classes.videoElementsWrapper}></div>
      </div>
   );
};

export default Streams;

Streams.propTypes = {
   externalMediaStreams: PropTypes.arrayOf(
      PropTypes.shape({
         audioMuted: PropTypes.bool,
         fallbackToAudio: PropTypes.bool,
         streamId: PropTypes.string,
         streamQuality: PropTypes.oneOf(["high"]),
         videoMuted: PropTypes.string,
         stream: PropTypes.shape({
            play: PropTypes.func,
            isPlaying: PropTypes.func,
         }),
      })
   ),
   localMediaStream: PropTypes.shape({
      audioMuted: PropTypes.bool,
      streamId: PropTypes.string,
      videoMuted: PropTypes.string,
      stream: PropTypes.shape({
         play: PropTypes.func,
         isPlaying: PropTypes.func,
      }),
   }),
};
