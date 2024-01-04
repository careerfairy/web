import { CustomJobStats } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useFirestoreDocument } from "./utils/useFirestoreDocument"

/**
 * Fetch a single Custom Job Stats
 *
 * @param jobId
 * @param groupId
 */
const useCustomJobStats = (jobId: string, groupId: string) => {
   const jobStatsId = `${groupId}_${jobId}`

   const { data } = useFirestoreDocument<CustomJobStats>(
      "customJobStats",
      [jobStatsId],
      {
         idField: "id",
      }
   )

   return data
}

export default useCustomJobStats
