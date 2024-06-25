import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching sparks content by tags : ${key}`,
      }),
}

export const useSparksByTags = (tags: GroupedTags) => {
   const fetcher = useFunctionsSWR<Spark[]>()

   return useSWR<Spark[]>(
      ["getSparksByTags", { tags: tags, limit: 10 }],
      fetcher,
      swrOptions
   )
}
