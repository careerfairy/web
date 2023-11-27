import { CustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import { useFirestoreDocument } from "./utils/useFirestoreDocument"

/**
 * Fetch Group Custom Jobs
 *
 * @param groupId
 * @param jobId
 */
const useGroupCustomJob = (groupId: string, jobId: string) => {
   const { data } = useFirestoreDocument<CustomJob>(
      "careerCenterData",
      [groupId, "customJobs", jobId],
      {
         idField: "id",
      }
   )

   return data
}

export default useGroupCustomJob
