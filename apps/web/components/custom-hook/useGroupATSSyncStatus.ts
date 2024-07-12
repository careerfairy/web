import { SyncStatus } from "@careerfairy/shared-lib/ats/SyncStatus"
import { useMemo } from "react"
import useSWR, { SWRConfiguration } from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"

type Result = {
   data: SyncStatus[]
}

const useGroupATSSyncStatus = (
   groupId: string,
   integrationId: string,
   swrConfiguration?: SWRConfiguration
): Result => {
   const fetcher = useFunctionsSWR<SyncStatus[]>()

   const { data } = useSWR(
      [
         "fetchATSSyncStatus_eu",
         {
            groupId,
            integrationId,
         },
      ],
      fetcher,
      swrConfiguration ?? reducedRemoteCallsOptions
   )

   return useMemo(() => {
      // map to business model (convert plain object to class object)
      const status = data
         .map((res) => SyncStatus.createFromPlainObject(res))
         // we don't care about the disabled entities
         .filter((model) => model.status !== "DISABLED")

      return {
         data: status,
      }
   }, [data])
}

export default useGroupATSSyncStatus
