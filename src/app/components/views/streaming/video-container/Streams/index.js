import PropTypes from "prop-types";
import React, { memo, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import StreamsLayout from "./StreamsLayout";
import Banners from "./Banners";

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
      sharingScreen,
      isBroadCasting,
      liveSpeakers,
      sharingPdf,
      showMenu,
      livestreamId,
      setRemovedStream,
      presenter,
      videoMutedBackgroundImg,
      handRaiseActive,
      mobile,
   }) => {
      const [streamData, setStreamData] = useState([]);
     const [bannersBottom, setBannersBottom] = useState(false);
     const classes = useStyles();

     useEffect(() => {
       setBannersBottom(Boolean(mobile && !presenter))
     }, [mobile, presenter]);
     

      useEffect(() => {
         const allStreams = [...externalMediaStreams];
         const hasManySpeakers = Boolean(externalMediaStreams?.length > 4);
         if (localMediaStream && isBroadCasting) {
            allStreams.unshift(localMediaStream);
         }

         let newLargeStream = handleGetLargeStream(
            allStreams,
            currentSpeakerId
         );
         if (!newLargeStream) {
            setStreamData([]);
            return;
         }
         let newSmallStreams = handleGetSmallStream(
            allStreams,
            newLargeStream,
            hasManySpeakers,
            currentSpeakerId,
            sharingScreen,
            sharingPdf
         );
         setStreamData([...newSmallStreams, newLargeStream]);
      }, [
         externalMediaStreams,
         localMediaStream,
         currentSpeakerId,
         isBroadCasting,
         sharingScreen,
         sharingPdf,
      ]);

      const handleGetLargeStream = (allStreams, currentSpeakerId) => {
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

         if (localStream) return localStream;

         if (!currentSpeakerStream && !screenShareStream && allStreams.length)
            return allStreams[0];

         return null;
      };

      const handleGetSmallStream = (
         allStreams,
         largeStream,
         sharingScreen,
         hasManySpeakers,
         currentSpeakerId
      ) => {
         const filteredStreams = allStreams.filter(
            (stream) => stream.streamId !== largeStream.streamId
         );
         if (sharingScreen && hasManySpeakers) {
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
            {!bannersBottom && (
               <Banners
                  presenter={presenter}
                  handRaiseActive={handRaiseActive}
               />
            )}
            <div className={classes.videoElementsWrapper}>
               <StreamsLayout
                  streamData={streamData}
                  liveSpeakers={liveSpeakers}
                  sharingPdf={sharingPdf}
                  videoMutedBackgroundImg={videoMutedBackgroundImg}
                  setRemovedStream={setRemovedStream}
                  currentSpeakerId={currentSpeakerId}
                  showMenu={showMenu}
                  livestreamId={livestreamId}
                  presenter={presenter}
               />
            </div>
            {bannersBottom &&
               <Banners
                 isBottom
                  presenter={presenter}
                  handRaiseActive={handRaiseActive}
               />
            }
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
   sharingPdf: PropTypes.bool,
};

export default Streams;
