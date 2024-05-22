import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, limit, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

type Options = {
   isPublished?: boolean
}

/**
 * This hook is used to check if a group has sparks.
 * We limit the query to 1 so that we don't have to load all the sparks.
 *
 * @returns {boolean} true if the group has sparks, false otherwise
 */
const useGroupHasSparks = (groupId: string, options?: Options) => {
   const groupSparksQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where("group.id", "==", groupId),
         ...(options?.isPublished
            ? [where("published", "==", options?.isPublished)]
            : []),
         limit(1)
      )
   }, [groupId, options?.isPublished])

   return (
      useFirestoreCollection<Spark>(groupSparksQuery, {
         idField: "id",
      }).data.length > 0
   )
}

export default useGroupHasSparks
