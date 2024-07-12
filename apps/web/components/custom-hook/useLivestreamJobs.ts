import { Job } from "@careerfairy/shared-lib/ats/Job"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import { useMemo } from "react"
import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"

type Result = {
   jobs: Job[]
}

const useLivestreamJobs = (
   livestreamId?: string,
   jobs?: LivestreamJobAssociation[]
): Result => {
   const fetcher = useFunctionsSWR<Job[]>()

   const { data } = useSWR(
      [
         "fetchLivestreamJobs_eu",
         {
            livestreamId,
            jobs,
         },
      ],
      fetcher,
      reducedRemoteCallsOptions
   )

   return useMemo(() => {
      // map to business model (convert plain object to class object)
      const jobs = data.map(Job.createFromPlainObject)

      return {
         jobs,
      }
   }, [data])
}

export default useLivestreamJobs
