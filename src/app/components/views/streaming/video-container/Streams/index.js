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
      const [hasManySpeakers, setHasManySpeakers] = useState(false);
      const classes = useStyles();

      useEffect(() => {
         setBannersBottom(Boolean(mobile && !presenter));
      }, [mobile, presenter]);

      useEffect(() => {
         const allStreams = [...externalMediaStreams];
         const newHasManySpeakers = Boolean(allStreams?.length > 4);
         setHasManySpeakers(newHasManySpeakers);
         if (
            localMediaStream &&
            localMediaStream.isPublished &&
            isBroadCasting
         ) {
            allStreams.unshift(localMediaStream);
         }
         if (!hasManySpeakers && sharingPdf) {
            setStreamData(allStreams);
            return;
         }
         let newLargeStream = handleGetLargeStream(
            allStreams,
            currentSpeakerId
         );
         if (!newLargeStream) {
            setStreamData([]);
            return;
         }
         let newSmallStreams = handleGetSmallStream(allStreams, newLargeStream);
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
            if (stream.uid.includes("screen")) {
               screenShareStream = stream;
            }
            if (stream.uid === currentSpeakerId) {
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

      const handleGetSmallStream = (allStreams, largeStream) => {
         return allStreams.filter((stream) => stream.uid !== largeStream.uid);
      };

      return (
         <div className={classes.root}>
            {!bannersBottom && (
               <Banners
                  presenter={presenter}
                  handRaiseActive={handRaiseActive}
                  mobile={mobile}
               />
            )}
            <div className={classes.videoElementsWrapper}>
               <StreamsLayout
                  streamData={streamData}
                  liveSpeakers={liveSpeakers}
                  sharingPdf={sharingPdf}
                  hasManySpeakers={hasManySpeakers}
                  sharingScreen={sharingScreen}
                  videoMutedBackgroundImg={videoMutedBackgroundImg}
                  setRemovedStream={setRemovedStream}
                  currentSpeakerId={currentSpeakerId}
                  showMenu={showMenu}
                  livestreamId={livestreamId}
                  presenter={presenter}
               />
            </div>
            {bannersBottom && (
               <Banners
                  isBottom
                  presenter={presenter}
                  handRaiseActive={handRaiseActive}
                  mobile={mobile}
               />
            )}
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
