import { useFirestore, useFirestoreDocDataOnce } from "reactfire"
import { doc } from "firebase/firestore"
import { CustomJob } from "@careerfairy/shared-lib/groups/customJobs"

/**
 * Fetch Group Custom Jobs
 *
 * @param groupId
 * @param jobId
 */
const useGroupCustomJob = (groupId: string, jobId: string) => {
   const ref = doc(
      useFirestore(),
      "careerCenterData",
      groupId,
      "customJobs",
      jobId
   )

   const { data } = useFirestoreDocDataOnce<CustomJob>(ref as any, {
      idField: "id",
   })

   return data
}

export default useGroupCustomJob
