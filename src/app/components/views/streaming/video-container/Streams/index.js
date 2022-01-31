import PropTypes from "prop-types";
import React, { memo, useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import StreamsLayout from "./StreamsLayout";
import Banners from "./Banners";
import { useSelector } from "react-redux";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import SuperAdminControls from "../SuperAdminControls";

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
      openStream,
      videoMutedBackgroundImg,
      handRaiseActive,
      mobile,
   }) => {
      const focusModeEnabled = useSelector(
         (state) => state.stream.layout.focusModeEnabled
      );
      const [streamData, setStreamData] = useState([]);
      const [bannersBottom, setBannersBottom] = useState(false);
      const [hasManySpeakers, setHasManySpeakers] = useState(false);
      const classes = useStyles();
      const { userData } = useAuth();

      useEffect(() => {
         setBannersBottom(Boolean((mobile || focusModeEnabled) && !presenter));
      }, [mobile, presenter, focusModeEnabled]);

      useEffect(() => {
         const allStreams = [...externalMediaStreams];
         const newHasManySpeakers = Boolean(allStreams?.length > 4);
         setHasManySpeakers(newHasManySpeakers);
         if (localMediaStream && isBroadCasting) {
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
            if (stream.streamId.includes("screen")) {
               screenShareStream = stream;
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

      const handleGetSmallStream = (allStreams, largeStream) => {
         return allStreams.filter(
            (stream) => stream.streamId !== largeStream.streamId
         );
      };

      return (
         <div className={classes.root}>
            {!bannersBottom && (
               <Banners
                  presenter={presenter}
                  handRaiseActive={handRaiseActive && !openStream}
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
               {userData?.isAdmin && <SuperAdminControls />}
            </div>
            {bannersBottom && (
               <Banners
                  isBottom
                  presenter={presenter}
                  handRaiseActive={handRaiseActive && !openStream}
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
