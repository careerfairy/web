import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, limit, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const now = new Date()

/**
 * Custom hook to check if a group has any live streams.
 * @param {string} groupId - The ID of the group to check for live streams.
 * @returns {boolean} - Returns true if the group has live streams, otherwise false.
 */
const useGroupHasUpcomingLivestreams = (groupId: string) => {
   const livestreamsQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "livestreams"),
         where("groupIds", "array-contains", groupId),
         where("start", ">", now),
         where("test", "==", false),
         limit(1)
      )
   }, [groupId])

   return (
      useFirestoreCollection<LivestreamEvent>(livestreamsQuery, {
         idField: "id",
      }).data.length > 0
   )
}

export default useGroupHasUpcomingLivestreams
