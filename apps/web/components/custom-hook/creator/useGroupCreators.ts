import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const useGroupCreators = (groupId: string) => {
   const groupCreatorsQuery = useMemo(() => {
      return query(
         collection(
            FirestoreInstance,
            "careerCenterData",
            groupId || "undefined",
            "creators"
         )
      )
   }, [groupId])

   return useFirestoreCollection<Creator>(groupCreatorsQuery, {
      idField: "id",
   })
}

export default useGroupCreators
