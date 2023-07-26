import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const useGroupSparks = (groupId: string) => {
   const groupSparksQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where("groupIds", "array-contains", groupId)
      )
   }, [groupId])

   return useFirestoreCollection<Spark>(groupSparksQuery, {
      idField: "id",
   })
}

export default useGroupSparks
