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

const useCountriesList = () => {
   const fetcher = useFunctionsSWR<Record<string, CountryOption>>()

   const { data, error, isLoading } = useSWR<Record<string, CountryOption>>(
      ["fetchCountriesList"],
      fetcher,
      swrOptions
   )

   const countries = data ?? {}

   return { data: countries, error, isLoading }
}

export default useCountriesList
