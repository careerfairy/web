import React, { useContext, useEffect } from "react";
import StreamItem from "./StreamItem";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import TutorialContext from "../../../../../../context/tutorials/TutorialContext";
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip
} from "../../../../../../materialUI/GlobalTooltips";

const RemoteStreamItem = ({
   speaker,
   setRemovedStream,
   stream,
   big,
   index,
   videoMutedBackgroundImg,
}) => {
   const { getActiveTutorialStepKey, handleConfirmStep } = useContext(
     TutorialContext
   );
   const activeStep = getActiveTutorialStepKey();
   const { playAllRemoteVideos, muteAllRemoteVideos } = useSelector(
      (state) => state.stream.streaming
   );

   const dispatch = useDispatch();

   const setAVideoIsMuted = () => dispatch(actions.setVideoIsMuted());

   useEffect(() => {
      if (muteAllRemoteVideos) {
         stream.stream?.play(stream.streamId, { muted: true });
      } else {
         stream.stream?.play(stream.streamId, { muted: false });
      }
   }, [muteAllRemoteVideos]);

   useEffect(() => {
      if (playAllRemoteVideos) {
         playVideo();
      }
   }, [playAllRemoteVideos]);

   useEffect(() => {
      if (muteAllRemoteVideos) {
         stream?.stream?.muteAudio();
      } else {
         stream?.stream?.unmuteAudio();
      }
   }, [muteAllRemoteVideos]);

   useEffect(() => {
      if (stream?.stream?.audio === false && stream?.stream?.video === false) {
         setRemovedStream(stream.streamId);
      }
   }, [stream?.stream?.audio, stream?.stream?.video]);



   function playVideo() {
      if (!stream.stream.isPlaying()) {
         stream.stream.play(
            stream.streamId,
            {
               fit: stream.isScreenShareVideo ? "contain" : "cover",
               muted: true,
            },
            (err) => {
               if (err) {
                  setAVideoIsMuted();
               }
            }
         );
      }
   }

   return (
     <WhiteTooltip
       placement="right"
       title={
          <React.Fragment>
             <TooltipTitle>Hand Raise (3/5)</TooltipTitle>
             <TooltipText>
                Once connected, the viewer who raised their hand will appear
                as an additional streamer
             </TooltipText>
             {activeStep === 11 && (
               <TooltipButtonComponent
                 onConfirm={() => {
                    handleConfirmStep(11);
                 }}
                 buttonText="Ok"
               />
             )}
          </React.Fragment>
       }
       open={activeStep === 11 && stream.streamId === "demoStream"}
     style={{
        width: "100%",
        display: "flex",
     }}
     >
      <StreamItem
         speaker={speaker}
         stream={stream}
         index={index}
         big={big}
         videoMutedBackgroundImg={videoMutedBackgroundImg}
      />
     </WhiteTooltip>
   );
};

export default RemoteStreamItem;
