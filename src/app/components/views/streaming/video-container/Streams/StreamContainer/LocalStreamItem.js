import React, { useEffect } from "react";
import StreamItem from "./StreamItem";

const LocalStreamItem = ({ stream, big, speaker, videoMutedBackgroundImg }) => {

   useEffect(() => {
      if (!stream.stream.isPlaying()) {
         stream?.stream?.play(stream.streamId);
      }
   }, [stream.streamId]);

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
