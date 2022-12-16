import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"
import { useMemo } from "react"
import { Application } from "@careerfairy/shared-lib/dist/ats/Application"

type Result = {
   applications: Application[]
}

const useGroupATSApplications = (
   groupId: string,
   integrationId: string,
   jobId?: string
): Result => {
   const fetcher = useFunctionsSWR<Application[]>()

   const { data } = useSWR(
      [
         "fetchATSApplications",
         {
            groupId,
            integrationId,
            jobId,
         },
      ],
      fetcher,
      reducedRemoteCallsOptions
   )

   return useMemo(() => {
      // map to business model (convert plain object to class object)
      const applications = data.results.map(Application.createFromPlainObject)

      return {
         applications,
      }
   }, [data])
}

export default useGroupATSApplications
