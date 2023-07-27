import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const useCreatorSparks = (
   creatorId: string,
   showHiddenSparks: boolean = false
) => {
   const creatorSparksQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where("creator.id", "==", creatorId),
         ...(showHiddenSparks ? [] : [where("published", "==", true)]),
         orderBy("createdAt", "desc")
      )
   }, [creatorId, showHiddenSparks])

   return useFirestoreCollection<Spark>(creatorSparksQuery, {
      idField: "id",
   })
}

export default useCreatorSparks
