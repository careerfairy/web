import React, { useMemo } from "react";
import { useFirestoreConnect } from "react-redux-firebase";
import { useRouter } from "next/router";
import { useAuth } from "../../HOCs/AuthProvider";

const useViewerHandRaiseConnect = (currentLivestream, streamerId) => {
   const { authenticatedUser } = useAuth();
   const {
      query: { livestreamId, breakoutRoomId },
   } = useRouter();

   const query = useMemo(() => {
      let query = [];
      const handRaiseDocId =
         currentLivestream?.test || currentLivestream?.openStream
            ? "anonymous" + streamerId
            : authenticatedUser.email;
      if (livestreamId) {
         if (breakoutRoomId) {
            query = [
               {
                  collection: "livestreams",
                  doc: livestreamId,
                  subcollections: [
                     {
                        collection: "breakoutRooms",
                        doc: breakoutRoomId,
                        subcollections: [
                           {
                              collection: "handRaises",
                              doc: handRaiseDocId,
                           },
                        ],
                     },
                  ],
                  storeAs: "handRaiseState",
               },
            ];
         } else {
            query = [
               {
                  collection: "livestreams",
                  doc: livestreamId,
                  storeAs: "handRaiseState",
                  subcollections: [
                     {
                        collection: "handRaises",
                        doc: handRaiseDocId,
                     },
                  ],
               },
            ];
         }
      }
      return query;
   }, [
      livestreamId,
      breakoutRoomId,
      streamerId,
      authenticatedUser.email,
      currentLivestream?.test,
   ]);

   useFirestoreConnect(query);
};

export default useViewerHandRaiseConnect;
