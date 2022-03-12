import * as actions from "./actionTypes";
import { sendGeneralError } from "./index";

// Create a new filter group and store it in redux as current filter group

const getTokenDoc = async ({
   firestore,
   isBreakout,
   breakoutRoomId,
   streamId,
}) => {
   let tokenDoc = undefined;
   if (isBreakout && breakoutRoomId) {
      tokenDoc = await firestore.get({
         collection: "livestreams",
         doc: streamId,
         subcollections: [
            {
               collection: "breakoutRooms",
               doc: breakoutRoomId,
               subcollections: [
                  {
                     collection: "tokens",
                     doc: "secureToken",
                  },
               ],
            },
         ],
      });
   } else {
      tokenDoc = await firestore.get({
         collection: "livestreams",
         doc: streamId,
         subcollections: [
            {
               collection: "tokens",
               doc: "secureToken",
            },
         ],
      });
   }
   return tokenDoc;
};

export const handleStartRecording =
   ({ firebase, streamId, isBreakout, breakoutRoomId }) =>
   async (dispatch, getState, { getFirestore }) => {
      dispatch({ type: actions.SET_RECORDING_REQUEST_STARTED });
      try {
         const firestore = getFirestore();
         let tokenDoc = await getTokenDoc({
            firestore,
            isBreakout,
            breakoutRoomId,
            streamId,
         });
         if (tokenDoc.exists) {
            const secureToken = tokenDoc.data().value;
            await firebase.startLivestreamRecording({
               isBreakout: isBreakout,
               streamId: streamId,
               breakoutRoomId: breakoutRoomId,
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

export const handleStopRecording =
   ({ firebase, streamId, isBreakout, breakoutRoomId }) =>
   async (dispatch, getState, { getFirestore }) => {
      dispatch({ type: actions.SET_RECORDING_REQUEST_STARTED });
      try {
         const firestore = getFirestore();
         const tokenDoc = await getTokenDoc({
            firestore,
            isBreakout,
            breakoutRoomId,
            streamId,
         });
         if (tokenDoc.exists) {
            const secureToken = tokenDoc.data().value;
            await firebase.stopLivestreamRecording({
               isBreakout: isBreakout,
               streamId: streamId,
               breakoutRoomId: breakoutRoomId,
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
