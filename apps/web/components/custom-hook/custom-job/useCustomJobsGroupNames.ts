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
   const options: Record<string, string> = useMemo(() => {
      return customJobs?.reduce((acc, job) => {
         acc[job.id] = job.groupId
         return acc
      }, {} as Record<string, string>)
   }, [customJobs])

   const fetcher = useFunctionsSWR<Result>()

   const { data, isLoading } = useSWR<Record<string, string>>(
      ["fetchCustomJobGroupNames", options],
      fetcher,
      { ...reducedRemoteCallsOptions, suspense: false }
   )

   return { data: data ?? {}, isLoading }
}

export default useCustomJobsGroupNames
