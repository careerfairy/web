import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import useStreamRef from "./useStreamRef";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";

const useStreamActiveHandRaises = () => {
   const streamRef = useStreamRef();
   const { updateHandRaiseRequest, setHandRaiseMode } = useFirebaseService();
   const handRaises = useSelector(
      (state) => state.firestore.ordered["handRaises"]
   );
   const [numberOfActiveHandRaisers, setNumberOfActiveHandRaisers] = useState(
      0
   );

   useEffect(() => {
      if (handRaises) {
         const newNumberOfActiveHandRaisers =
            handRaises.filter((handRaise) =>
               ["connecting", "connected", "invited"].includes(handRaise.state)
            )?.length || 0;
         setNumberOfActiveHandRaisers(newNumberOfActiveHandRaisers);
      } else {
         setNumberOfActiveHandRaisers(0);
      }
   }, [handRaises]);

   const handlers = useMemo(
      () => ({
         updateRequest: async (handRaiseId, state) =>
            updateHandRaiseRequest(streamRef, handRaiseId, state),
         setHandRaiseModeInactive: async () =>
            setHandRaiseMode(streamRef, false),
      }),
      [streamRef]
   );

   return { handRaises, handlers, numberOfActiveHandRaisers };
};

export default useStreamActiveHandRaises;
