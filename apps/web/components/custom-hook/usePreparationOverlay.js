import React from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import useStreamRef from "./useStreamRef"

const usePreparationOverlay = () => {
   const streamRef = useStreamRef()
   const { updateSpeakersInLivestream, addSpeakerInLivestream } =
      useFirebaseService()

   const updateSpeaker = (speaker) => {
      return updateSpeakersInLivestream(streamRef, speaker)
   }

   const addSpeaker = (speaker) => {
      return addSpeakerInLivestream(streamRef, speaker)
   }

   return {
      updateSpeaker,
      addSpeaker,
   }
}

export default usePreparationOverlay
