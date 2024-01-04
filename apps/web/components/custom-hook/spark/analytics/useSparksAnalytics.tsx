import { useMemo } from "react"
import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../../utils/useFunctionsSWRFetcher"
import { convertToClientModel } from "components/custom-hook/spark/analytics/dataTransformers"

const useSparksAnalytics = (groupId: string) => {
   const fetcher = useFunctionsSWR()

   const { data } = useSWR(
      ["getSparksAnalytics", { groupId }],
      fetcher,
      reducedRemoteCallsOptions
   )

   return useMemo(() => {
      return convertToClientModel(data)
   }, [data])
}

export default useSparksAnalytics
