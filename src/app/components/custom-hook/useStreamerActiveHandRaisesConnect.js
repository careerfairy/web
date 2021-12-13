import React, { useMemo } from "react";
import { useFirestoreConnect } from "react-redux-firebase";
import { useRouter } from "next/router";
import { useAuth } from "../../HOCs/AuthProvider";

const useStreamerActiveHandRaisesConnect = () => {
   const {
      query: { livestreamId, breakoutRoomId },
   } = useRouter();

   const query = useMemo(() => {
      let query = [];
      const whereQuery = [
         "state",
         "not-in",
         ["denied", "unrequested", "acquire_media"],
      ];
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
                              where: [whereQuery],
                           },
                        ],
                     },
                  ],
                  storeAs: "handRaises",
               },
            ];
         } else {
            query = [
               {
                  collection: "livestreams",
                  doc: livestreamId,
                  storeAs: "handRaises",
                  subcollections: [
                     {
                        collection: "handRaises",
                        where: [whereQuery],
                     },
                  ],
               },
            ];
         }
      }
      return query;
   }, [livestreamId, breakoutRoomId]);

   useFirestoreConnect(query);
};

export default useStreamerActiveHandRaisesConnect;
