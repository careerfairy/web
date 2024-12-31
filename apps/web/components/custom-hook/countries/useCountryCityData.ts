import useSWR, { SWRConfiguration } from "swr"

import {
   CityOption,
   CountryOption,
} from "@careerfairy/shared-lib/countries/types"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   onError: (error) =>
      errorLogAndNotify(error, {
         message: `Error fetching country and city data`,
      }),
}

type Data = {
   country: CountryOption
   city: CityOption
}

const useCountryCityData = (
   countryIsoCode: string,
   generatedCityId: string
) => {
   const fetcher = useFunctionsSWR<Data>()

   const { data, error, isLoading } = useSWR<Data>(
      ["fetchCountryCityData", { countryIsoCode, generatedCityId }],
      fetcher,
      swrOptions
   )

   return { data, error, isLoading }
}

export default useCountryCityData
