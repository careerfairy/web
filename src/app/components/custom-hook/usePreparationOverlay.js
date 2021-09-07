import React from "react";
import { useFirebase } from "context/firebase";
import useStreamRef from "./useStreamRef";

const usePreparationOverlay = () => {
   const streamRef = useStreamRef();
   const { updateSpeakersInLivestream, addSpeakerInLivestream } = useFirebase();

   const updateSpeaker = (speaker) => {
      return updateSpeakersInLivestream(streamRef, speaker);
   };

   const addSpeaker = (speaker) => {
      return addSpeakerInLivestream(streamRef, speaker);
   };

   return {
      updateSpeaker,
      addSpeaker,
   };
};

export default usePreparationOverlay;
