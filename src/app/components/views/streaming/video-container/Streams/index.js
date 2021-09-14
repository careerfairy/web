import PropTypes from "prop-types";
import React, { memo, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import StreamsLayout from "./StreamsLayout";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: theme.palette.grey["900"],
   },
   videoElementsWrapper: {
      flex: 1,
      display: "flex",
   },
}));

const Streams = memo(
   ({
      externalMediaStreams,
      localMediaStream,
      currentSpeakerId,
      sharingContent,
      isBroadCasting,
      liveSpeakers,
     play,
     unmute
   }) => {
      const classes = useStyles();
      const [streamData, setStreamData] = useState([]);

      useEffect(() => {
         const allStreams = [...externalMediaStreams];
         const hasManySpeakers = Boolean(externalMediaStreams?.length > 4);
         if (localMediaStream && isBroadCasting) {
            allStreams.push(localMediaStream);
         }

         let newLargeStream = handleGetLargeStream(
            allStreams,
            currentSpeakerId,
            sharingContent
         );
         if(!newLargeStream){
            setStreamData([])
            return
         }
         let newSmallStreams = handleGetSmallStream(
            allStreams,
            newLargeStream,
            sharingContent,
            hasManySpeakers,
            currentSpeakerId
         );
         setStreamData([...newSmallStreams, newLargeStream]);
      }, [
         externalMediaStreams,
         localMediaStream,
         currentSpeakerId,
         sharingContent,
         isBroadCasting,
      ]);

      const handleGetLargeStream = (
         allStreams,
         currentSpeakerId,
         sharingContent
      ) => {
         let screenShareStream;
         let currentSpeakerStream;
         let localStream;

         for (const stream of allStreams) {
            if (stream.streamId.includes("screen")) {
               screenShareStream = { ...stream, isScreenShareVideo: true };
            }
            if (stream.streamId === currentSpeakerId) {
               currentSpeakerStream = stream;
            }

            if (stream.isLocal) {
               localStream = stream;
            }
         }

         if (screenShareStream) return screenShareStream;

         if (currentSpeakerStream) return currentSpeakerStream;

         if (sharingContent) return { loadingShare: true };

         if (localStream) return localStream;

         if (!currentSpeakerStream && !screenShareStream && allStreams.length)
            return allStreams[0];

         return null;
      };

      const handleGetSmallStream = (
         allStreams,
         largeStream,
         sharingContent,
         hasManySpeakers,
         currentSpeakerId
      ) => {
         const filteredStreams = allStreams.filter(
            (stream) => stream.streamId !== largeStream.streamId
         );
         if (sharingContent && hasManySpeakers) {
            return makeCurrentSpeakerFirstInStream(
               filteredStreams,
               currentSpeakerId
            );
         }
         return filteredStreams;
      };

      const makeCurrentSpeakerFirstInStream = (streams, currentSpeakerId) => {
         let currentSpeakerStream = streams.find(
            (stream) => stream.streamId === currentSpeakerId
         );
         let rearrangedVideoStreams = streams.filter(
            (stream) => stream.streamId !== currentSpeakerId
         );
         if (currentSpeakerStream) {
            rearrangedVideoStreams.unshift(currentSpeakerStream);
         }
         return rearrangedVideoStreams;
      };

      return (
         <div className={classes.root}>
            {/*<Button variant="contained">*/}
            {/*  dfwefew*/}
            {/*</Button>*/}
            <div className={classes.videoElementsWrapper}>
               <StreamsLayout
                  streamData={streamData}
                  liveSpeakers={liveSpeakers}
                  play={play}
                  unmute={unmute}
               />
            </div>
         </div>
      );
   }
);

Streams.propTypes = {
   externalMediaStreams: PropTypes.arrayOf(
      PropTypes.shape({
         audioMuted: PropTypes.bool,
         fallbackToAudio: PropTypes.bool,
         streamId: PropTypes.string,
         streamQuality: PropTypes.oneOf(["high", "low"]),
         videoMuted: PropTypes.bool,
         stream: PropTypes.shape({
            play: PropTypes.func,
            isPlaying: PropTypes.func,
         }),
      })
   ),
   localMediaStream: PropTypes.shape({
      audioMuted: PropTypes.bool,
      streamId: PropTypes.string,
      videoMuted: PropTypes.bool,
      stream: PropTypes.shape({
         play: PropTypes.func,
         isPlaying: PropTypes.func,
      }),
   }),
   play: PropTypes.bool,
   unmute: PropTypes.bool,
};

export default Streams;
