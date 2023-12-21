import { collection, orderBy, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { CustomJobStats } from "@careerfairy/shared-lib/customJobs/customJobs"

/**
 * Fetch Custom Jobs Stats
 *
 * @param groupId
 * @param getDeletedJobs
 */
const useCustomJobsStats = (groupId: string, getDeletedJobs = false) => {
   const collectionRef = query(
      collection(useFirestore(), "customJobStats"),
      where("groupId", "==", groupId),
      where("deleted", "==", getDeletedJobs),
      orderBy("job.createdAt", "desc")
   )

   const { data } = useFirestoreCollection<CustomJobStats>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   return data
}

export default useCustomJobsStats
