import { useMemo } from "react"
import { collection, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../data/firebase/FirebaseInstance"
import useCountQuery from "../../../../custom-hook/useCountQuery"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { Group } from "@careerfairy/shared-lib/groups"

const useCanPublishMoreSparks = (group: Group): boolean => {
   const q = useMemo(() => {
      return query(
         collection(FirestoreInstance, "sparks"),
         where("group.id", "==", group.id),
         where("published", "==", true)
      )
   }, [group])

   const publicSparks = useCountQuery(q)

   return Boolean(
      publicSparks.count <
         (group?.maxPublicSparks || SPARK_CONSTANTS.MAX_PUBLIC_SPARKS)
   )
}

export default useCanPublishMoreSparks
