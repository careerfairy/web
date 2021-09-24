import React, { useEffect } from "react";
import StreamItem from "./StreamItem";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";

const RemoteStreamItem = ({
   speaker,
   setRemovedStream,
   stream,
   big,
   index,
   videoMutedBackgroundImg,
}) => {
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

   function generateDemoHandRaiser() {
      let video = document.createElement("video");
      const videoContainer = document.querySelector("#" + stream.streamId);
      videoContainer.appendChild(video);
      video.src = stream.url;
      video.loop = true;
      video.play();
   }

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
      <StreamItem
         speaker={speaker}
         stream={stream}
         index={index}
         big={big}
         videoMutedBackgroundImg={videoMutedBackgroundImg}
      />
   );
};

export default RemoteStreamItem;
