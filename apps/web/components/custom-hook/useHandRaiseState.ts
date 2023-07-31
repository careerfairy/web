import { useCallback, useEffect, useMemo, useRef } from "react"
import { useSelector } from "react-redux"
import { useCurrentStream } from "context/stream/StreamContext"
import { useAuth } from "HOCs/AuthProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import useStreamRef from "./useStreamRef"
import { MAX_STREAM_DEFAULT_ACTIVE_HAND_RAISERS } from "constants/streams"
import { RootState } from "store"
import { HandRaise } from "types/handraise"
import { rewardService } from "data/firebase/RewardService"

const useHandRaiseState = () => {
   const { currentLivestream, handRaiseId, presenter } = useCurrentStream()
   const { authenticatedUser, userData } = useAuth()
   const prevHandRaiseState = useRef<HandRaise>(null)

   const streamRef = useStreamRef()
   const { createHandRaiseRequest, updateHandRaiseRequest } =
      useFirebaseService()

   const mainStreamId = presenter?.getMainStreamId()

   const numberOfActiveHandRaises = useSelector(
      (state: RootState) =>
         state.firestore.ordered["handRaises"]?.filter(
            (handRaise: HandRaise) =>
               ["connecting", "connected", "invited"].includes(
                  handRaise.state
               ) && handRaise.id !== handRaiseId
         )?.length || 0
   )

   const handRaise: HandRaise | undefined = useSelector(
      (state: RootState) => state.firestore.data["handRaises"]?.[handRaiseId]
   )

   const updateRequest: (state: HandRaise["state"]) => Promise<void> =
      useCallback(
         async (state) => {
            const isAnon = Boolean(
               currentLivestream.test ||
                  currentLivestream.openStream ||
                  !authenticatedUser?.email
            )
            let checkedUserData = isAnon
               ? {
                    firstName: userData?.firstName || "Hand Raiser",
                    lastName: userData?.lastName || "Streamer",
                 }
               : userData
            try {
               if (handRaise) {
                  await updateHandRaiseRequest(streamRef, handRaiseId, state)

                  if (userData && state === "requested") {
                     rewardService
                        .userAction("LIVESTREAM_USER_HAND_RAISED", mainStreamId)
                        .then((_) => console.log("Rewarded Hand Raised"))
                        .catch(console.error)
                  }
               } else {
                  await createHandRaiseRequest(
                     streamRef,
                     handRaiseId,
                     checkedUserData,
                     state
                  )
               }
            } catch (e) {
               console.error(e)
            }
         },
         [
            mainStreamId,
            currentLivestream.test,
            currentLivestream.openStream,
            authenticatedUser?.email,
            userData,
            streamRef,
            handRaise,
         ]
      )
   const hasRoom: boolean = useMemo(
      () =>
         Boolean(
            numberOfActiveHandRaises <
               (currentLivestream.maxHandRaisers ??
                  MAX_STREAM_DEFAULT_ACTIVE_HAND_RAISERS)
         ),
      [currentLivestream?.maxHandRaisers, numberOfActiveHandRaises]
   )

   useEffect(() => {
      prevHandRaiseState.current = handRaise
   }, [handRaise])

   return [handRaise, updateRequest, hasRoom, prevHandRaiseState] as const
}

export default useHandRaiseState
