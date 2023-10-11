import { collection } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useMemo } from "react"
import {
   CustomJob,
   pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/groups/customJobs"
import { useFirestoreCollection } from "./utils/useFirestoreCollection"

/**
 * Fetch Group Custom Jobs
 *
 * @param groupId
 */
const useGroupCustomJobs = (groupId: string) => {
   const collectionRef = collection(
      useFirestore(),
      "careerCenterData",
      groupId,
      "customJobs"
   )

   const { data } = useFirestoreCollection<CustomJob>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   return useMemo(
      () => data.map((document) => pickPublicDataFromCustomJob(document)),
      [data]
   )
}

export default useGroupCustomJobs
