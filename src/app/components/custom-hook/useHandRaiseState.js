import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { useCurrentStream } from "../../context/stream/StreamContext";
import { useAuth } from "../../HOCs/AuthProvider";
import { useFirebase } from "../../context/firebase";
import useStreamRef from "./useStreamRef";

const useHandRaiseState = () => {
   const {currentLivestream} = useCurrentStream()
   const {authenticatedUser, userData} = useAuth()
   const streamRef = useStreamRef()
   const {
      createHandRaiseRequest,
      updateHandRaiseRequest,
   } = useFirebase();
   const handRaiseState = useSelector((state) => state.firestore.data["handRaiseState"])

   const updateRequest = useCallback( state => {
      if (currentLivestream.test || authenticatedUser.email) {
         let authEmail = currentLivestream.test
           ? "streamerEmail"
           : authenticatedUser.email;
         let checkedUserData = currentLivestream.test
           ? { firstName: "Test", lastName: "Streamer" }
           : userData;
         if (handRaiseState) {
            updateHandRaiseRequest(
              streamRef,
              authEmail,
              state
            );
         } else {
            createHandRaiseRequest(streamRef, authEmail, checkedUserData);
         }
      }
   },[currentLivestream.test, authenticatedUser.email, userData, streamRef, handRaiseState]);

   return [handRaiseState, updateRequest];
};

export default useHandRaiseState;
