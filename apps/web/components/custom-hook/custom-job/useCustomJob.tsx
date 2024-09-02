import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * Fetch Custom Jobs
 *
 * @param jobId
 */
const useCustomJob = (jobId: string) => {
   console.log("🚀 ~ useCustomJob ~ jobId:", jobId)

   const { data } = useFirestoreDocument<CustomJob>("customJobs", [jobId], {
      idField: "id",
   })

   return data
}

export default useCustomJob
