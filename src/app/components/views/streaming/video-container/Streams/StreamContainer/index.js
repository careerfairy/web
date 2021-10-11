import React, { useEffect, useState } from "react";
import LocalStreamItem from "./LocalStreamItem";
import RemoteStreamItem from "./RemoteStreamItem";
import { useFirebase } from "context/firebase";

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
      (async () => {
         if (speaker || fetching) return;
         let newSpeaker;
         if (stream.streamId === "demoStream") {
            newSpeaker = {
               firstName: "Demo",
               lastName: "Speaker",
               position: "✋ Hand Raiser",
            };
         } else if (stream.streamId.includes("screen")) {
            newSpeaker = null;
         } else {
            newSpeaker = liveSpeakers?.find(
               (speaker) => speaker.speakerUuid === stream.streamId
            );
            if (!newSpeaker && stream.streamId && livestreamId) {
               const userId = stream.streamId.replace(livestreamId, "");
               if (userId) {
                  newSpeaker = await getSpeakerInfoFromDB(userId);
               }
            }
         }
         setSpeaker(newSpeaker);
      })();
   }, [stream.streamId.includes("screen"), liveSpeakers, stream.streamId]);

   const getSpeakerInfoFromDB = async (userId) => {
      let fetchedSpeaker = {
         firstName: "",
         lastName: "",
         position: "",
      };
      try {
         setFetching(true);
         const userSnap = await getUserData(userId);
         if (userSnap.exists) {
            const userData = userSnap.data();
            fetchedSpeaker = {
               firstName: userData.firstName || "",
               lastName: userData?.lastName?.[0] || "",
               position: "✋ Hand Raiser",
            };
         }
      } catch (e) {
         return fetchedSpeaker;
      }
      setFetching(false);
      return fetchedSpeaker;
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
