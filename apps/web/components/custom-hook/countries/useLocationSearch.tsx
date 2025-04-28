import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
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
         message: `Error searching locations list`,
      }),
}

const getKey = (searchValue: string) => {
   return searchValue.length >= MIN_SEARCH_LENGTH
      ? ["searchLocations", { searchValue }]
      : null
}

export const useLocationSearch = (searchValue: string, suspense = true) => {
   const fetcher = useFunctionsSWR<OptionGroup[]>()
   const [debouncedValue, setDebouncedValue] = useState("")

   useDebounce(
      () => {
         setDebouncedValue(searchValue)
      },
      DEBOUNCE_MS,
      [searchValue]
   )

   return useSWR<OptionGroup[]>(getKey(debouncedValue), fetcher, {
      ...swrOptions,
      suspense,
   })
}
