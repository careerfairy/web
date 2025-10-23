import { useMemo } from "react"
import { collectionGroup, limit, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"

/**
 * Fetches the stats for a given livestream if it belongs to the given group.
 **/
const useGroupLivestreamStat = (groupId: string, livestreamId: string) => {
   const livestreamStatsQuery = useMemo(() => {
      return query(
         collectionGroup(FirestoreInstance, "stats"),
         where("id", "==", "livestreamStats"),
         where("livestream.groupIds", "array-contains", groupId),
         where("livestream.id", "==", livestreamId),
         limit(1) // we only want the first result
      )
   }, [groupId, livestreamId])

   return useFirestoreCollection<LiveStreamStats>(livestreamStatsQuery, {
      idField: "id",
      suspense: false,
   })
}

export default useGroupLivestreamStat
