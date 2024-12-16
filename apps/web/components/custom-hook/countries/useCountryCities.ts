import useSWR, { SWRConfiguration } from "swr"

import { CityOption } from "@careerfairy/shared-lib/countries/types"
import { useMemo } from "react"
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
         message: `Error fetching countries list: ${key}`,
      }),
}

const useCountryCities = (countryCode: string) => {
   const fetcher = useFunctionsSWR<CityOption[]>()

   const options = useMemo(() => {
      return {
         countryCode,
      }
   }, [countryCode])

   const { data, error, isLoading } = useSWR<CityOption[]>(
      ["fetchCountryCitiesList", options],
      fetcher,
      swrOptions
   )

   return { data: data ?? [], error, isLoading }
}

export default useCountryCities
