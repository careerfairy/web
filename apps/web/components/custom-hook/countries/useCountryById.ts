import useSWR, { SWRConfiguration } from "swr"

import { CountryOption } from "@careerfairy/shared-lib/countries/types"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching country by id: ${key}`,
      }),
}

const useCountryById = (countryIsoCode: string, suspense = true) => {
   const fetcher = useFunctionsSWR<CountryOption>()

   const { data, error, isLoading } = useSWR<CountryOption>(
      countryIsoCode?.length ? ["fetchCountryData", { countryIsoCode }] : null,
      fetcher,
      {
         ...swrOptions,
         suspense,
      }
   )

   return { data, error, isLoading }
}

export default useCountryById
