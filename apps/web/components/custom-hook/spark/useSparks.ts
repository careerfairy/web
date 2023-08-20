import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

import { limit } from "@firebase/firestore"
import { collection, documentId, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

/**
 * Fetches the stats for a given spark if it belongs to the given group.
 **/
const useSparks = (totalItems: number) => {
   const sparksQuery = query(
      collection(FirestoreInstance, "sparks"),
      limit(totalItems) // we only want the first result
   )

   return useFirestoreCollection<Spark>(sparksQuery).data ?? []
}

export default useSparks
