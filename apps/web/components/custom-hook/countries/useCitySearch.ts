import { CityOption } from "@careerfairy/shared-lib/countries/types"
import { useState } from "react"
import { useDebounce } from "react-use"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const DEBOUNCE_MS = 500
const MIN_SEARCH_LENGTH = 2
const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   onError: (error) =>
      errorLogAndNotify(error, {
         message: `Error searching cities list`,
      }),
}

const getKey = (searchValue: string, countryId: string) => {
   return searchValue.length >= MIN_SEARCH_LENGTH && countryId?.length
      ? ["searchCities", { searchValue, countryId }]
      : null
}

export const useCitySearch = (
   searchValue: string,
   countryId: string,
   suspense = true
) => {
   const fetcher = useFunctionsSWR<CityOption[]>()
   const [debouncedValue, setDebouncedValue] = useState("")

   useDebounce(
      () => {
         setDebouncedValue(searchValue)
      },
      DEBOUNCE_MS,
      [searchValue]
   )

   return useSWR<CityOption[]>(getKey(debouncedValue, countryId), fetcher, {
      ...swrOptions,
      suspense,
   })
}
