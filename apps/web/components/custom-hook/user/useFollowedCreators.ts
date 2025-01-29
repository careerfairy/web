import { LevelsMentor } from "@careerfairy/shared-lib/talent-guide"
import { useMemo } from "react"
import useSWR from "swr"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const useFollowedCreators = () => {
   const fetcher = useFunctionsSWRFetcher<LevelsMentor[]>()

   const { data } = useSWR(
      ["getFollowedCreators"],
      fetcher,
      reducedRemoteCallsOptions
   )

   return useMemo<LevelsMentor[]>(() => {
      return data
   }, [data])
}

export default useFollowedCreators
