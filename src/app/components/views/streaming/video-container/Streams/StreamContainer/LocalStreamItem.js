import React, { useEffect } from "react";
import StreamItem from "./StreamItem";

const LocalStreamItem = ({
   stream,
   big,
   speaker,
   index,
   videoMutedBackgroundImg,
}) => {
   // useEffect(() => {
   //       console.log("-> STARTING TO PLAY", stream.streamId);
   //       // if (!stream.stream.isPlaying()) {
   //       stream?.stream?.play(
   //         stream.streamId,
   //         { fit: stream.isScreenShareVideo ? "contain" : "cover" },
   //         (err) => {
   //            if (err) {
   //               console.log("-> err", err);
   //               // setShowVideoButton({ paused: false, muted: true });
   //            }
   //         }
   //       );
   //
   //       // NEW
   //       return () => {
   //          stream?.stream?.stop()
   //       }
   // }, [stream.streamId]);

   return (
      <StreamItem
         speaker={speaker}
         videoMutedBackgroundImg={videoMutedBackgroundImg}
         stream={stream}
         big={big}
      />
   );
};

export default LocalStreamItem;
