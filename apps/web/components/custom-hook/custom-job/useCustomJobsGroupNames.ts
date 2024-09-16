import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useMemo } from "react"
import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

type Result = {
   [jobId: string]: string
}
const useCustomJobsGroupNames = (customJobs: CustomJob[]) => {
   const options: { [jobId: string]: { groupId: string } } = useMemo(() => {
      return customJobs
         .map((job) => {
            return {
               [job.id]: {
                  groupId: job.groupId,
               },
            }
         })
         .reduce((acc, curr) => {
            return { ...acc, ...curr } // Merge the current object into the accumulator
         }, {})
   }, [customJobs])

   const fetcher = useFunctionsSWR<Result>()

   return useSWR(
      ["fetchCustomJobGroupNames", options],
      fetcher,
      reducedRemoteCallsOptions
   )
}

export default useCustomJobsGroupNames
