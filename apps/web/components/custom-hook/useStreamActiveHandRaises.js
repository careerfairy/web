import React, { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import useStreamRef from "./useStreamRef"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { MAX_STREAM_DEFAULT_ACTIVE_HAND_RAISERS } from "constants/streams"
import { useCurrentStream } from "context/stream/StreamContext"

const useStreamActiveHandRaises = () => {
   const streamRef = useStreamRef()
   const { currentLivestream } = useCurrentStream()
   const maxHandRaisers =
      currentLivestream.maxHandRaisers ?? MAX_STREAM_DEFAULT_ACTIVE_HAND_RAISERS

   const { updateHandRaiseRequest, setHandRaiseMode } = useFirebaseService()
   const handRaises = useSelector(
      (state) => state.firestore.ordered["handRaises"]
   )
   const [numberOfActiveHandRaisers, setNumberOfActiveHandRaisers] = useState(0)

   useEffect(() => {
      if (handRaises) {
         const newNumberOfActiveHandRaisers =
            handRaises.filter((handRaise) =>
               ["connecting", "connected", "invited"].includes(handRaise.state)
            )?.length || 0
         setNumberOfActiveHandRaisers(newNumberOfActiveHandRaisers)
      } else {
         setNumberOfActiveHandRaisers(0)
      }
   }, [handRaises])

   const handlers = useMemo(
      () => ({
         updateRequest: async (handRaiseId, state) =>
            updateHandRaiseRequest(streamRef, handRaiseId, state),
         setHandRaiseModeInactive: async () =>
            setHandRaiseMode(streamRef, false),
      }),
      [streamRef]
   )

   const hasRoom = useMemo(
      () => numberOfActiveHandRaisers < maxHandRaisers,
      [maxHandRaisers, numberOfActiveHandRaisers]
   )

   return {
      handRaises,
      handlers,
      numberOfActiveHandRaisers,
      hasRoom,
      maxHandRaisers,
   }
}

export default useStreamActiveHandRaises
