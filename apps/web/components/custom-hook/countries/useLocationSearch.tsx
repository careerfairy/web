import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   onError: (error) =>
      errorLogAndNotify(error, {
         message: `Error searching locations list`,
      }),
}

const getKey = () => {
   return ["searchLocations"]
}

export const useLocationSearch = (suspense = true) => {
   const fetcher = useFunctionsSWR<OptionGroup[]>()

   return useSWR<OptionGroup[]>(getKey(), fetcher, {
      ...swrOptions,
      suspense,
   })
}
