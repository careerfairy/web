import React, { useMemo } from "react";
import LocalStreamItem from "./LocalStreamItem";
import RemoteStreamItem from "./RemoteStreamItem";

const StreamContainer = ({
   stream,
   big,
   liveSpeakers,
   index,
   setRemovedStream,
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
      />
   ) : (
      <RemoteStreamItem
         big={big}
         setRemovedStream={setRemovedStream}
         index={index}
         stream={stream}
         speaker={speaker}
      />
   );
};

export default StreamContainer;
