import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

type Result = {
   [jobId: string]: string
}
const useCustomJobsGroupNames = (customJobs: CustomJob[]) => {
   const options: { [jobId: string]: { groupId: string } } = {}

   customJobs.forEach((job) => {
      options[job.id] = {
         groupId: job.groupId,
      }
   })

   const fetcher = useFunctionsSWR<Result>()

   return useSWR(
      ["fetchCustomJobGroupNames", options],
      fetcher,
      reducedRemoteCallsOptions
   )
}

export default useCustomJobsGroupNames
