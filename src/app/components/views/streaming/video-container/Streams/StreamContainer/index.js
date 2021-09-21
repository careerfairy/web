import React, { useEffect, useState } from "react";
import LocalStreamItem from "./LocalStreamItem";
import RemoteStreamItem from "./RemoteStreamItem";
import { useFirebase } from "context/firebase";
//
const StreamContainer = ({
   stream,
   big,
   liveSpeakers,
   index,
   setRemovedStream,
   videoMutedBackgroundImg,
   livestreamId,
}) => {
   const { getUserData } = useFirebase();
   const [speaker, setSpeaker] = useState(null);
   const [fetching, setFetching] = useState(false);
   useEffect(() => {
      if (speaker || fetching) return;
      let newSpeaker;
      if (stream.isScreenShareVideo) {
         newSpeaker = null;
      } else {
         newSpeaker = liveSpeakers?.find(
            (speaker) => speaker.speakerUuid === stream.streamId
         );
         if (!newSpeaker && stream.streamId && livestreamId) {
            const userId = stream.streamId.replace(livestreamId, "");
            if (userId) getSpeakerInfoFromDB(userId);
         }
      }
      setSpeaker(newSpeaker);
   }, [stream.isScreenShareVideo, liveSpeakers, stream.streamId]);

   const getSpeakerInfoFromDB = async (userId) => {
      try {
         setFetching(true);
         const userSnap = await getUserData(userId);
         if (userSnap.exists) {
            const userData = userSnap.data();
            setSpeaker({
               firstName: userData.firstName || "",
               lastName: userData?.lastName?.[0] || "",
               position: "Audience",
            });
         }
      } catch (e) {}
      setFetching(false);
   };

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
