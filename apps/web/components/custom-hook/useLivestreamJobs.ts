import useSWR from "swr"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"
import { useMemo } from "react"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"

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
