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

   return useMemo(
      () => (atsJobs.length ? atsJobs : livestreamCustomJobs || []),
      [atsJobs, livestreamCustomJobs]
   )
}
