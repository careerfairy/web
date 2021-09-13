import React, { useMemo } from "react";
import LocalStreamItem from "./LocalStreamItem";
import RemoteStreamItem from "./RemoteStreamItem";

const StreamContainer = ({ stream, big, liveSpeakers }) => {

   const speaker = useMemo(
      () =>
         !stream.isScreenShareVideo
            ? liveSpeakers?.find(
                 (speaker) => speaker.speakerUuid === stream.streamId
              )
            : null,
      [stream.isScreenShareVideo, liveSpeakers]
   );

   return stream.isLocal ? (
      <LocalStreamItem
         big={big}
         stream={stream}
         speaker={speaker}
      />
   ) : (
      <RemoteStreamItem
         big={big}
         stream={stream}
         speaker={speaker}
      />
   );
};

export default StreamContainer;
