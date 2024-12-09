import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

import { limit } from "@firebase/firestore"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, documentId, query, where } from "firebase/firestore"
import { useMemo } from "react"

/**
 * Fetches the data of a given spark
 **/
const useSpark = (sparkId: string): Spark | null => {
   const sparkByIdQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where(documentId(), "==", sparkId),
         limit(1) // we only want the first result
      )
   }, [sparkId])

   return (
      useFirestoreCollection<Spark>(sparkByIdQuery, {
         idField: "id",
      }).data?.[0] ?? null
   )
}

export default useSpark
