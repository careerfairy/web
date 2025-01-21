import { CountryOption } from "@careerfairy/shared-lib/countries/types"
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
         message: `Error searching countries list`,
      }),
}

const getKey = (searchValue: string) => {
   return searchValue.length >= MIN_SEARCH_LENGTH
      ? ["searchCountries", { searchValue }]
      : null
}

export const useCountrySearch = (searchValue: string, suspense = true) => {
   const fetcher = useFunctionsSWR<CountryOption[]>()
   const [debouncedValue, setDebouncedValue] = useState("")

   useDebounce(
      () => {
         setDebouncedValue(searchValue)
      },
      DEBOUNCE_MS,
      [searchValue]
   )

   return useSWR<CountryOption[]>(getKey(debouncedValue), fetcher, {
      ...swrOptions,
      suspense,
   })
}
