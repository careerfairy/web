import { CustomJobStats } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * Fetch a single Custom Job Stats
 *
 * @param jobId
 */
const useCustomJobStats = (jobId: string) => {
   const { data } = useFirestoreDocument<CustomJobStats>(
      "customJobStats",
      [jobId],
      {
         idField: "id",
      }
   )

   return data
}

export default useCustomJobStats
