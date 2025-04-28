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
         message: `Error retrieving location`,
      }),
}

const getKey = (locationId: string) => {
   return locationId?.length >= 2
      ? ["getLocation", { searchValue: locationId }]
      : null
}

const useLocation = (locationId: string, suspense = true) => {
   const fetcher = useFunctionsSWR<OptionGroup>()

   return useSWR<OptionGroup>(getKey(locationId), fetcher, {
      ...swrOptions,
      suspense,
   })
}

export default useLocation
