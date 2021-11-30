import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useCurrentStream } from "../../context/stream/StreamContext";
import { useAuth } from "../../HOCs/AuthProvider";
import { useFirebase } from "../../context/firebase";
import useStreamRef from "./useStreamRef";

const useHandRaiseState = (streamerId) => {
   const { currentLivestream } = useCurrentStream();
   const { authenticatedUser, userData } = useAuth();

   const streamRef = useStreamRef();
   const { createHandRaiseRequest, updateHandRaiseRequest } = useFirebase();
   const handRaiseState = useSelector(
      (state) => state.firestore.data["handRaiseState"]
   );

   const updateRequest = useCallback(
      (state) => {
         debugger;
         if (
            currentLivestream.test ||
            currentLivestream.openStream ||
            authenticatedUser.email
         ) {
            let authEmail =
               currentLivestream.test || currentLivestream.openStream
                  ? "anonymous" + streamerId
                  : authenticatedUser.email;
            let checkedUserData =
               currentLivestream.test || currentLivestream.openStream
                  ? { firstName: "Hand Raiser", lastName: "Streamer" }
                  : userData;
            if (handRaiseState) {
               updateHandRaiseRequest(streamRef, authEmail, state);
            } else {
               createHandRaiseRequest(streamRef, authEmail, checkedUserData);
            }
         }
      },
      [
         currentLivestream.test,
         currentLivestream.openStream,
         authenticatedUser.email,
         userData,
         streamerId,
         streamRef,
         handRaiseState,
      ]
   );

   return [handRaiseState, updateRequest];
};

export default useHandRaiseState;
