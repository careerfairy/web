import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

import { limit } from "@firebase/firestore"
import { collection, documentId, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

/**
 * Fetches the data of a given spark if it belongs to the given group.
 **/
const useGroupSpark = (groupId: string, sparkId: string) => {
   const sparkByIdQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where(documentId(), "==", sparkId),
         where("group.id", "==", groupId),
         limit(1) // we only want the first result
      )
   }, [groupId, sparkId])

   return (
      useFirestoreCollection<Spark>(sparkByIdQuery, {
         idField: "id",
      }).data?.[0] ?? null
   )
}

export default useGroupSpark
