import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, limit, query, where } from "firebase/firestore"
import { useMemo } from "react"
import useCountQuery from "../useCountQuery"

/**
 * Custom hook to count the number of upcoming livestreams for a group.
 * @param {string} groupId - The ID of the group to check for live streams.
 * @returns {CountQuery} - Returns the count of upcoming livestreams for the group.
 */
const useCountGroupUpcomingLivestreams = (groupId: string) => {
   const livestreamsQuery = useMemo(() => {
      const now = new Date()

      return query(
         collection(FirestoreInstance, "livestreams"),
         where("groupIds", "array-contains", groupId),
         where("start", ">", now),
         where("test", "==", false),
         where("hidden", "==", false),
         limit(1)
      )
   }, [groupId])

   return useCountQuery(livestreamsQuery)
}

export default useCountGroupUpcomingLivestreams
