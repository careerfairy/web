import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

import { collection, query, limit, where } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

/**
 * Fetches the stats for a given spark if it belongs to the given group.
 **/
const useSparks = (totalItems?: number, groupId?: String) => {
   const sparksQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where("group.publicSparks", "==", true),
         where("published", "==", true),
         ...(groupId ? [where("group.id", "==", groupId)] : []),
         ...(totalItems ? [limit(totalItems)] : [])
      )
   }, [groupId, totalItems])

   return useFirestoreCollection<Spark>(sparksQuery)
}

export default useSparks
