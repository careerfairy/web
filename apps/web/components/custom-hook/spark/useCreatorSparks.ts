import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const useCreatorSparks = (creatorId: string) => {
   const creatorSparksQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where("creator.id", "==", creatorId),
         orderBy("createdAt", "desc")
      )
   }, [creatorId])

   return useFirestoreCollection<Spark>(creatorSparksQuery, {
      idField: "id",
   })
}

export default useCreatorSparks
