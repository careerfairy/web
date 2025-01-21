import useSWR, { SWRConfiguration } from "swr"

import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   onError: (error) =>
      errorLogAndNotify(error, {
         message: `Error fetching countries list`,
      }),
}

const useCountriesList = (suspense = true) => {
   const fetcher = useFunctionsSWR<Record<string, CountryOption>>()

   const { data, error, isLoading, mutate } = useSWR<
      Record<string, CountryOption>
   >(["fetchCountriesList"], fetcher, {
      ...swrOptions,
      suspense,
   })

   const countries = data ?? {}

   return { data: countries, error, isLoading, mutate }
}

export default useCountriesList
