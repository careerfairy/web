import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

import { collection, query, limit, where, documentId } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

/**
 * Fetches the stats for a given spark if it belongs to the given group.
 **/
const useSparks = (totalItems?: number, groupdId?: String) => {
   const sparksQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         ...(groupdId ? [where("group.id", "==", groupdId)] : []),
         ...(totalItems ? [limit(totalItems)] : [])
      )
   }, [totalItems])

   return useFirestoreCollection<Spark>(sparksQuery)
}

export default useSparks
