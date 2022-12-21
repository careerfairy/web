import useSWR from "swr"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"
import { useMemo } from "react"
import {
   ATSDataPaginationOptions,
   ATSPaginatedResults,
} from "@careerfairy/shared-lib/dist/ats/Functions"

const useGroupATSJobs = (
   groupId: string,
   integrationId: string,
   pagination?: ATSDataPaginationOptions
): ATSPaginatedResults<Job> => {
   const fetcher = useFunctionsSWR<ATSPaginatedResults<Job>>()

   const { data } = useSWR(
      [
         "fetchATSJobs_v2",
         {
            groupId,
            integrationId,
            ...pagination,
         },
      ],
      fetcher,
      reducedRemoteCallsOptions
   )

   return useMemo(() => {
      // map to business model (convert plain object to class object)
      const jobs = data.results
         .map(Job.createFromPlainObject)
         .map((job: Job) => {
            job.setIntegrationId(integrationId)
            return job
         })

      return {
         ...data,
         results: jobs,
      }
   }, [data, integrationId])
}

export default useGroupATSJobs
