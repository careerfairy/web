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
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching country states list: ${key}`,
      }),
}

const useCountryStates = (countryCode: string, suspense = true) => {
   const fetcher = useFunctionsSWR<Record<string, CityOption>>()

   const options = useMemo(() => {
      return {
         countryCode,
      }
   }, [countryCode])

   const { data, error, isLoading, mutate } = useSWR<
      Record<string, CityOption>
   >(["fetchCountryStatesList", options], fetcher, {
      ...swrOptions,
      suspense,
   })

   return { data: data ?? [], error, isLoading, mutate }
}

export default useCountryStates
