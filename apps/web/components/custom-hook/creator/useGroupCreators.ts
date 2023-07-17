import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const useGroupCreators = (groupId: string) => {
   const groupSparksQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "careerCenterData", groupId, "creators")
      )
   }, [groupId])

   return useFirestoreCollection<Creator>(groupSparksQuery, {
      idField: "id",
   })
}

export default useGroupCreators
