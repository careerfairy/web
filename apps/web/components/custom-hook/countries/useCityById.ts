import useSWR, { SWRConfiguration, preload } from "swr"

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
         message: `Error fetching city by id: ${key}`,
      }),
}

const useCityById = (generatedCityId: string, suspense = true) => {
   const fetcher = useFunctionsSWR<CityOption>()

   const options = useMemo(() => {
      return {
         generatedCityId,
      }
   }, [generatedCityId])

   const { data, error, isLoading } = useSWR<CityOption>(
      ["fetchCityData", options],
      fetcher,
      {
         ...swrOptions,
         suspense,
      }
   )

   return { data, error, isLoading }
}

/*
 * Hook to preload the recommended eventIds and store them in the SWR cache
 * */
export const usePreFetchCityById = (generatedCityId: string | null) => {
   const fetcher = useFunctionsSWR<CityOption>()

   preload(["fetchCityData", { generatedCityId }], fetcher)
   return null
}

export default useCityById
