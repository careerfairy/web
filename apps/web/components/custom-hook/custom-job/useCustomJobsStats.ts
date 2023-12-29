import { collection, orderBy, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { CustomJobStats } from "@careerfairy/shared-lib/customJobs/customJobs"

type Options = {
   deletedJobs?: boolean
}

/**
 * Fetch Custom Jobs Stats
 *
 * @param groupId
 * @param options
 */
const useCustomJobsStats = (groupId: string, options: Options = {}) => {
   const { deletedJobs = false } = options

   const collectionRef = query(
      collection(useFirestore(), "customJobStats"),
      where("groupId", "==", groupId),
      where("deleted", "==", deletedJobs),
      orderBy("job.createdAt", "desc")
   )

   const { data } = useFirestoreCollection<CustomJobStats>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   return data
}

export default useCustomJobsStats
