import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useCurrentStream } from "context/stream/StreamContext";
import { useAuth } from "HOCs/AuthProvider";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import useStreamRef from "./useStreamRef";
import { MAX_STREAM_DEFAULT_ACTIVE_HAND_RAISERS } from "constants/streams";
import RootState from "store/reducers";
import { HandRaise } from "types/handraise";

const useHandRaiseState = (streamerId) => {
   const { currentLivestream, handRaiseId } = useCurrentStream();
   const { authenticatedUser, userData } = useAuth();

   const streamRef = useStreamRef();
   const {
      createHandRaiseRequest,
      updateHandRaiseRequest,
   } = useFirebaseService();

   const numberOfActiveHandRaises = useSelector(
      (state: RootState) =>
         state.firestore.ordered["handRaises"]?.filter(
            (handRaise: HandRaise) =>
               ["connecting", "connected", "invited"].includes(
                  handRaise.state
               ) && handRaise.id !== handRaiseId
         )?.length || 0
   );

   const handRaiseState: HandRaise = useSelector(
      (state: RootState) => state.firestore.data["handRaises"]?.[handRaiseId]
   );

   const updateRequest = useCallback(
      async (state: HandRaise["state"]) => {
         const isAnon = Boolean(
            currentLivestream.test ||
               currentLivestream.openStream ||
               !authenticatedUser?.email
         );
         let checkedUserData = isAnon
            ? {
                 firstName: userData?.firstName || "Hand Raiser",
                 lastName: userData?.lastName || "Streamer",
              }
            : userData;
         try {
            if (handRaiseState) {
               await updateHandRaiseRequest(streamRef, handRaiseId, state);
            } else {
               await createHandRaiseRequest(
                  streamRef,
                  handRaiseId,
                  checkedUserData
               );
            }
         } catch (e) {
            console.error(e);
         }
      },
      [
         currentLivestream.test,
         currentLivestream.openStream,
         authenticatedUser?.email,
         userData,
         streamerId,
         streamRef,
         handRaiseState,
      ]
   );
   const hasRoom: boolean = useMemo(
      () =>
         Boolean(
            numberOfActiveHandRaises <
               (currentLivestream.maxHandRaisers ??
                  MAX_STREAM_DEFAULT_ACTIVE_HAND_RAISERS)
         ),
      [currentLivestream?.maxHandRaisers, numberOfActiveHandRaises]
   );

   return [handRaiseState, updateRequest, hasRoom];
};

export default useHandRaiseState;
