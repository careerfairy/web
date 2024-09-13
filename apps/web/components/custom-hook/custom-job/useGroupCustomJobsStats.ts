import { CustomJobStats } from "@careerfairy/shared-lib/customJobs/customJobs"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

type Options = {
   deletedJobs?: boolean
}

/**
 * Fetch Custom Jobs Stats
 *
 * @param groupId
 * @param options
 */
const useGroupCustomJobsStats = (groupId: string, options: Options = {}) => {
   const { deletedJobs } = options

   const collectionRef = query(
      collection(useFirestore(), "customJobStats"),
      where("groupId", "==", groupId),
      ...(deletedJobs !== undefined
         ? [where("deleted", "==", deletedJobs)]
         : []),
      orderBy("job.deadline", "asc")
   )

   const { data } = useFirestoreCollection<CustomJobStats>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   return data
}

export default useGroupCustomJobsStats
