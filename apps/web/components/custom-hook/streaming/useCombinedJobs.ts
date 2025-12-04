import { sortCustomJobs } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useMemo } from "react"
import useGroupCustomJobs from "../custom-job/useGroupCustomJobs"

/**
 * Custom hook to fetch custom jobs for a given live stream and host company
 */
export const useCombinedJobs = (
   livestreamId: string,
   hostCompanyId: string
) => {
   const livestreamCustomJobs = useGroupCustomJobs(hostCompanyId, {
      livestreamId: livestreamId,
   })

   return useMemo(
      () => sortCustomJobs(livestreamCustomJobs) || [],
      [livestreamCustomJobs]
   )
}
