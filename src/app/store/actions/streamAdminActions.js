import * as actions from "./actionTypes";
import { sendGeneralError } from "./index";

// Create a new filter group and store it in redux as current filter group
export const handleStartRecording = ({ firebase, streamId }) => async (
   dispatch,
   getState,
   { getFirestore }
) => {
   dispatch({ type: actions.SET_RECORDING_REQUEST_STARTED });
   try {
      const firestore = getFirestore();
      const tokenDoc = await firestore.get({
         collection: "livestreams",
         doc: streamId,
         subcollections: [
            {
               collection: "tokens",
               doc: "secureToken",
            },
         ],
      });
      if (tokenDoc.exists) {
         const secureToken = tokenDoc.data().value;
         await firebase.startLivestreamRecording({
            streamId: streamId,
            token: secureToken,
         });

         dispatch({ type: actions.SET_RECORDING_REQUEST_STOPPED });
      } else {
         dispatch({ type: actions.SET_RECORDING_REQUEST_STOPPED });
         dispatch(sendGeneralError("This stream has no token"));
      }
   } catch (e) {
      dispatch({ type: actions.SET_RECORDING_REQUEST_STOPPED });
      dispatch(sendGeneralError(e));
   }
};

export const handleStopRecording = ({ firebase, streamId }) => async (
   dispatch,
   getState,
   { getFirestore }
) => {
   dispatch({ type: actions.SET_RECORDING_REQUEST_STARTED });
   try {
      const firestore = getFirestore();
      const tokenDoc = await firestore.get({
         collection: "livestreams",
         doc: streamId,
         subcollections: [
            {
               collection: "tokens",
               doc: "secureToken",
            },
         ],
      });
      if (tokenDoc.exists) {
         const secureToken = tokenDoc.data().value;
         await firebase.stopLivestreamRecording({
            streamId: streamId,
            token: secureToken,
         });
         dispatch({ type: actions.SET_RECORDING_REQUEST_STOPPED });
      } else {
         dispatch({ type: actions.SET_RECORDING_REQUEST_STOPPED });
         dispatch(sendGeneralError("This stream has no token"));
      }
   } catch (e) {
      dispatch({ type: actions.SET_RECORDING_REQUEST_STOPPED });
      dispatch(sendGeneralError(e));
   }
};
