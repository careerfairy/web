import React, { useEffect } from "react";
import StreamItem from "./StreamItem";

const LocalStreamItem = ({ stream, big, speaker, videoMutedBackgroundImg }) => {
   useEffect(() => {
      if (!stream.videoTrack.isPlaying) {
         stream.videoTrack?.play(stream.uid);
      }
   }, [stream.uid]);

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
