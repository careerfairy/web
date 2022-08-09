import useSWR from "swr"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"
import { useMemo } from "react"

type Result = {
   jobs: Job[]
}

const useGroupATSJobs = (groupId: string, integrationId: string): Result => {
   const fetcher = useFunctionsSWR<Job[]>()

   const { data } = useSWR(
      [
         "fetchATSJobs",
         {
            groupId,
            integrationId,
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

export default useGroupATSJobs
