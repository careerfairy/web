import useSWR, { SWRConfiguration } from "swr"

import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: true,
   onError: (error) =>
      errorLogAndNotify(error, {
         message: `Error fetching countries list`,
      }),
}

const useCountriesList = () => {
   const fetcher = useFunctionsSWR<CountryOption[]>()

   const { data, error, isLoading } = useSWR<CountryOption[]>(
      ["fetchCountriesList"],
      fetcher,
      swrOptions
   )

   return { data: data ?? [], error, isLoading }
}

export default useCountriesList
