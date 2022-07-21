import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"
import { useMemo } from "react"
import { SyncStatus } from "@careerfairy/shared-lib/dist/ats/SyncStatus"

type Result = {
   data: SyncStatus[]
}

const useGroupATSSyncStatus = (
   groupId: string,
   integrationId: string
): Result => {
   const fetcher = useFunctionsSWR<SyncStatus[]>()

   const { data } = useSWR(
      [
         "fetchATSSyncStatus",
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
      const status = data.map((res) => SyncStatus.createFromPlainObject(res))

      return {
         data: status,
      }
   }, [data])
}

export default useGroupATSSyncStatus
