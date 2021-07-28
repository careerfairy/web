import React, { useMemo } from "react";
import { useRouter } from "next/router";

/**
 * Create a react-redux-firebase query for a stream, this hook automatically detects of the stream is normal or a breakout room.
 * @param {({storeAs: String, [subcollections]: Array<Object>, [deps]: Array, [populates]: Array<String>})} arrayOfEmails – Array of email strings
 * @return {Array<Object>} Returns an array of a single memoized query for the useFirestoreConnect Hook.
 */
const useStreamQuery = ({
   storeAs = "unnamedQuery",
   subcollections,
   deps,
   populates,
}) => {
   const {
      query: { livestreamId, breakoutRoomId },
   } = useRouter();

   const query = useMemo(() => {
      let query;
      if (breakoutRoomId) {
         query = [
            {
               collection: "livestreams",
               doc: livestreamId,
               subcollections: [
                  {
                     collection: "breakoutRooms",
                     doc: breakoutRoomId,
                     subcollections,
                  },
               ],
               populates,
               storeAs: storeAs,
            },
         ];
      } else {
         query = [
            {
               collection: "livestreams",
               doc: livestreamId,
               subcollections,
               populates,
               storeAs: storeAs,
            },
         ];
      }
      return query;
   }, [breakoutRoomId, livestreamId, deps, storeAs, subcollections, populates]);

   return query;
};

export default useStreamQuery;
