import React from "react";
import StreamItem from "./StreamItem";

const LocalStreamItem = ({ stream, big, speaker, videoMutedBackgroundImg }) => {
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
