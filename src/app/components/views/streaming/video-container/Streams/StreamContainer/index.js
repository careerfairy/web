import React, { useMemo } from "react";
import LocalStreamItem from "./LocalStreamItem";
import RemoteStreamItem from "./RemoteStreamItem";

const StreamContainer = ({
   stream,
   big,
   liveSpeakers,
   index,
   setRemovedStream,
   videoMutedBackgroundImg,
}) => {
   const speaker = useMemo(
      () =>
         !stream.isScreenShareVideo
            ? liveSpeakers?.find(
                 (speaker) => speaker.speakerUuid === stream.streamId
              )
            : null,
      [stream.isScreenShareVideo, liveSpeakers, stream.streamId]
   );

   return stream.isLocal ? (
      <LocalStreamItem
         big={big}
         stream={stream}
         index={index}
         speaker={speaker}
         videoMutedBackgroundImg={videoMutedBackgroundImg}
      />
   ) : (
      <RemoteStreamItem
         big={big}
         setRemovedStream={setRemovedStream}
         index={index}
         stream={stream}
         speaker={speaker}
         videoMutedBackgroundImg={videoMutedBackgroundImg}
      />
   );
};

export default StreamContainer;
