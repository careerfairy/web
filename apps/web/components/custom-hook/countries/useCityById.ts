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

export default useCityById
