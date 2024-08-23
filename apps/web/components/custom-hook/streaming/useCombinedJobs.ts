import { sortCustomJobs } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useMemo } from "react"
import useGroupCustomJobs from "../custom-job/useGroupCustomJobs"
import useLivestreamJobs from "../useLivestreamJobs"

/**
 * Custom hook to fetch ATS jobs and custom jobs for a given live stream and host company
 */
export const useCombinedJobs = (
   livestreamId: string,
   hostCompanyId: string
) => {
   const { jobs: atsJobs } = useLivestreamJobs(livestreamId)
   const livestreamCustomJobs = useGroupCustomJobs(hostCompanyId, {
      livestreamId: livestreamId,
   })

   const sortedJobs = useMemo(
      () => sortCustomJobs(livestreamCustomJobs),
      [livestreamCustomJobs]
   )

   return useMemo(
      () => (atsJobs.length ? atsJobs : sortedJobs || []),
      [atsJobs, sortedJobs]
   )
}
