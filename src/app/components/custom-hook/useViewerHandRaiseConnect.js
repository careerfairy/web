import React, { useMemo } from "react";
import { useFirestoreConnect } from "react-redux-firebase";
import { useRouter } from "next/router";
import { useAuth } from "../../HOCs/AuthProvider";

const useViewerHandRaiseConnect = (currentLivestream, handRaiseId) => {
   const { authenticatedUser } = useAuth();
   const {
      query: { livestreamId, breakoutRoomId },
   } = useRouter();

   const query = useMemo(() => {
      let query = [];
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
                              doc: handRaiseId,
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
                        doc: handRaiseId,
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
      handRaiseId,
      authenticatedUser.email,
      currentLivestream?.test,
   ]);

   useFirestoreConnect(query);
};

export default useViewerHandRaiseConnect;
