import { TagsContentHits } from "@careerfairy/shared-lib/constants/tags"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: false,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching tags content hits: ${key}`,
      }),
}

export const useTagsContentHits = () => {
   const fetcher = useFunctionsSWR<TagsContentHits>()
   return useSWR<TagsContentHits>(
      ["fetchTagsContentHits", {}],
      fetcher,
      swrOptions
   )
}
