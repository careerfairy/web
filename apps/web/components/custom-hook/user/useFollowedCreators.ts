import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { useMemo } from "react"
import useSWR from "swr"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const useFollowedCreators = () => {
   const fetcher = useFunctionsSWRFetcher<Creator[]>()

   const { data } = useSWR(
      ["getFollowedCreators"],
      fetcher,
      reducedRemoteCallsOptions
   )

   return useMemo<Creator[]>(() => {
      return data
   }, [data])
}

export default useFollowedCreators
