import React, { useCallback, useEffect, useState } from "react"
import { useCurrentStream } from "../../context/stream/StreamContext"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import useStreamRef from "./useStreamRef"

/**
 * @param {(null | Object)} localMediaStream - The employee who is responsible for the project.
 * @param {string} localMediaStream.stream.uid - The name of the employee.
 * @param {Object[]} externalMediaStreams - An Array of external stream Objects
 * @returns {{}} Returns the 3 stream link types
 */
const useCurrentSpeaker = (localMediaStream, externalMediaStreams) => {
   const streamRef = useStreamRef()
   const {
      isMainStreamer,
      currentLivestream: {
         currentSpeakerId: firestoreCurrentSpeaker,
         mode,
         screenSharerId,
         speakerSwitchMode,
         id: streamId,
      },
   } = useCurrentStream()
   const [audioCounter, setAudioCounter] = useState(0)

   const { setLivestreamCurrentSpeakerId } = useFirebaseService()
   const [currentSpeakerId, setCurrentSpeakerId] = useState(
      firestoreCurrentSpeaker
   )

   useEffect(() => {
      if (speakerSwitchMode !== "manual") {
         const unsubscribe = manageCurrentSpeaker({ isFallback: true })
         return () => unsubscribe()
      }
   }, [audioCounter, mode, externalMediaStreams.length, localMediaStream])

   const manageCurrentSpeaker = (options = { isFallback: false }) => {
      const isFallback = Boolean(options.isFallback)
      let timeout = setTimeout(() => {
         let audioLevels = externalMediaStreams.map((stream) => {
            if (stream.uid !== "demoStream" && stream.audioTrack) {
               return {
                  streamId: stream.uid,
                  audioLevel: stream.audioTrack.getVolumeLevel(),
               }
            } else {
               return {
                  streamId: stream.uid,
                  audioLevel: 0,
               }
            }
         })
         if (localMediaStream && localMediaStream.audioTrack) {
            audioLevels.push({
               streamId: localMediaStream.uid,
               audioLevel: localMediaStream.audioTrack.getVolumeLevel(),
            })
         }
         if (audioLevels && audioLevels.length > 1) {
            const maxEntry = audioLevels.reduce((prev, current) =>
               prev.audioLevel > current.audioLevel ? prev : current
            )
            if (maxEntry.audioLevel > 0.05) {
               handleChangeCurrentSpeakerId(maxEntry.streamId, isFallback)
            } else if (
               !audioLevels.some(
                  (audioLevel) =>
                     audioLevel.streamId === firestoreCurrentSpeaker
               )
            ) {
               handleChangeCurrentSpeakerId(maxEntry.streamId, isFallback)
            }
         }
         setAudioCounter(audioCounter + 1)
      }, 2500)

      return () => {
         clearTimeout(timeout)
      }
   }

   useEffect(() => {
      if (isMainStreamer && mode === "desktop") {
         handleChangeCurrentSpeakerId(screenSharerId)
      }
   }, [mode])

   useEffect(() => {
      if (externalMediaStreams && firestoreCurrentSpeaker) {
         // TODO get rid of this
         let existingCurrentSpeaker = externalMediaStreams.find(
            (stream) => stream.uid === firestoreCurrentSpeaker
         )
         if (!existingCurrentSpeaker) {
            handleChangeCurrentSpeakerId(streamId)
         }
      }
   }, [externalMediaStreams])

   useEffect(() => {
      if (firestoreCurrentSpeaker) {
         setCurrentSpeakerId(firestoreCurrentSpeaker)
      }
   }, [firestoreCurrentSpeaker])

   const handleChangeCurrentSpeakerId = useCallback(
      (id, isFallback = false) => {
         if (isFallback || !id) return setCurrentSpeakerId(id)
         setLivestreamCurrentSpeakerId(streamRef, id)
      },
      [setLivestreamCurrentSpeakerId, streamRef]
   )

   return currentSpeakerId
}

export default useCurrentSpeaker
