import PropTypes from "prop-types";
import React, { memo, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import StreamsLayout from "./StreamsLayout";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    display: "flex",
    flexDirection: "column"
  },
  videoElementsWrapper: {
    backgroundColor: "orange",
    // width: "100%",
    // flex: 1,
    // flexGrow: 1
    height: 500
  },
}));

const Streams = memo(
  ({
     externalMediaStreams,
     localMediaStream,
     currentSpeakerId,
     sharingContent,
   }) => {
    const classes = useStyles();
    const [streamData, setStreamData] = useState({
      largeStream: null,
      smallStreams: [],
    });
    console.log("-> streamData", streamData);

    useEffect(() => {
      setStreamData(({ largeStream, smallStreams }) => {
        const allStreams = [...externalMediaStreams];
        const hasManySpeakers = Boolean(externalMediaStreams?.length > 4);
        if (localMediaStream) {
          allStreams.push(localMediaStream);
        }
        console.log("-> allStreams base", allStreams);

        let newLargeStream = handleGetLargeStream(
          allStreams,
          currentSpeakerId,
          sharingContent
        );
        let newSmallStreams = handleGetSmallStream(
          allStreams,
          newLargeStream,
          sharingContent,
          hasManySpeakers,
          currentSpeakerId
        );

        return {
          largeStream: newLargeStream,
          smallStreams: newSmallStreams,
        };
      });
    }, [
      externalMediaStreams,
      localMediaStream,
      currentSpeakerId,
      sharingContent,
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

export default Streams;
