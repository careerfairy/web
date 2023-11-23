import { collection, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../../../data/firebase/FirebaseInstance"
import useCountQuery from "../../../../custom-hook/useCountQuery"

const useCanPublishMoreSparks = (
   groupId: string,
   maxPublicSparks: number
): boolean => {
   const q = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where("group.id", "==", groupId),
         where("published", "==", true)
      )
   }, [groupId])

   const publicSparks = useCountQuery(q)

   return Boolean(publicSparks.count < maxPublicSparks)
}

export default useCanPublishMoreSparks
