import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "./utils/useFunctionsSWRFetcher"

const useSparksAnalytics = (groupId: string) => {
   const fetcher = useFunctionsSWR()

   const { data } = useSWR(
      ["getSparksAnalytics", { groupId }],
      fetcher,
      reducedRemoteCallsOptions
   )

   return data
}

export default useSparksAnalytics
