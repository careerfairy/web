import React, { useMemo } from "react";
import { useFirestoreConnect } from "react-redux-firebase";
import { shallowEqual, useSelector } from "react-redux";
import { useRouter } from "next/router";
import currentLivestreamSelector from "../selectors/currentLivestreamSelector";

const useStreamConnect = () => {
   const {
      query: { livestreamId, breakoutRoomId },
   } = useRouter();

   const populates = [
      {
         child: "groupIds",
         root: "careerCenterData",
         childAlias: "careerCenters",
      },
   ];
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
                     },
                  ],
                  storeAs: "currentLivestream",
                  populates,
               },
            ];
         } else {
            query = [
               {
                  collection: "livestreams",
                  doc: livestreamId,
                  storeAs: "currentLivestream",
                  populates,
               },
            ];
         }
      }
      return query;
   }, [livestreamId, breakoutRoomId]);
   // console.log("-> query", query);

   useFirestoreConnect(query);

   return useSelector(
      (state) =>
         currentLivestreamSelector(state, {
            streamId: breakoutRoomId || livestreamId,
         })
      // shallowEqual
   );
};

export default useStreamConnect;
