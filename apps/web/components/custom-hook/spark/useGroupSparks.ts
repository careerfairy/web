import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, limit, orderBy, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

type Options = {
   limit?: number
   isPublished?: boolean
}

const useGroupSparks = (groupId: string, options?: Options) => {
   const groupSparksQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where("group.id", "==", groupId),
         ...(options?.isPublished
            ? [where("published", "==", options?.isPublished)]
            : []),
         orderBy("createdAt", "desc"),
         ...(options?.limit ? [limit(options.limit)] : [])
      )
   }, [groupId, options?.isPublished, options?.limit])

   return useFirestoreCollection<Spark>(groupSparksQuery, {
      idField: "id",
   })
}

export default useGroupSparks
