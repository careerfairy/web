import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { Creator } from "@careerfairy/shared-lib/groups/creators"

const useCreatorSparks = (
   creator: Creator,
   showHiddenSparks: boolean = false
) => {
   const creatorSparksQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where("creator.id", "==", creator.id),
         where("creator.groupId", "==", creator.groupId),
         ...(showHiddenSparks ? [] : [where("published", "==", true)]),
         orderBy("createdAt", "desc")
      )
   }, [creator.id, creator.groupId, showHiddenSparks])

   return useFirestoreCollection<Spark>(creatorSparksQuery, {
      idField: "id",
   })
}

export default useCreatorSparks
