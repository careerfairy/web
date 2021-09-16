import React, { useEffect } from "react";
import StreamItem from "./StreamItem";
import { useSelector } from "react-redux";

const RemoteStreamItem = ({
   speaker,
   setRemovedStream,
   setShowVideoButton,
   stream,
   big,
   index,
}) => {
   const { playAllRemoteVideos, muteAllRemoteVideos } = useSelector((state) => state.stream.streaming);

   // useEffect(() => {
   //    if (stream.streamId === "demoStream") {
   //       generateDemoHandRaiser();
   //    } else {
   //       console.log("-> STARTING TO PLAY", stream.streamId);
   //       // if (!stream.stream.isPlaying()) {
   //          stream?.stream?.play(
   //             stream.streamId,
   //             { fit: stream.isScreenShareVideo ? "contain" : "cover" },
   //             (err) => {
   //                if (err) {
   //                   console.log("-> err", err);
   //                   setShowVideoButton({ paused: false, muted: true });
   //                }
   //             }
   //          );
   //
   //          // NEW
   //          return () => {
   //             stream?.stream?.stop()
   //          }
   //       // }
   //    }
   // }, [stream.streamId]);

   useEffect(() => {
      if (!muteAllRemoteVideos) {
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
                  setShowVideoButton({ paused: false, muted: true });
               }
            }
         );
      }
   }

   return (
      <StreamItem speaker={speaker} stream={stream} index={index} big={big} />
   );
};

export default RemoteStreamItem;
