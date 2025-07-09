import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

type Options = {
   initialData?: CustomJob[]
}

export const usePublishedCustomJobs = (options?: Options) => {
   const { initialData = [] } = options || {}

   const currentDate = useMemo(() => new Date(), [])

   const collectionRef = useMemo(() => {
      return query(
         collection(FirestoreInstance, "customJobs"),
         where("published", "==", true),
         where("deleted", "==", false),
         where("isPermanentlyExpired", "==", false),
         where("deadline", ">=", currentDate),
         orderBy("deadline", "asc")
      )
   }, [currentDate])

   return useFirestoreCollection<CustomJob>(collectionRef, {
      idField: "id",
      suspense: false,
      initialData,
   })
}
