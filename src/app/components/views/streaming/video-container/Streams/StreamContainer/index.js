import React, { useMemo } from "react";
import LocalStreamItem from "./LocalStreamItem";
import RemoteStreamItem from "./RemoteStreamItem";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
   videoElement: {
      width: "100%",
      height: "100%",
      position: "absolute",
      "& > *": {
         borderRadius: 10,
         boxShadow: theme.shadows[5],
      },
   },
}));
const StreamContainer = ({ stream, big, liveSpeakers , play, unmute, index}) => {
   const classes = useStyles();
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
         unmute={unmute}
         play={play}
      />
   ) : (
      <RemoteStreamItem
         big={big}
         index={index}
         play={play}
         unmute={unmute}
         stream={stream}
         speaker={speaker}
      />
   );
};

export default StreamContainer;
