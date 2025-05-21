import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import { useState } from "react"
import { useDebounce } from "react-use"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const DEBOUNCE_MS = 200

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   onError: (error) =>
      errorLogAndNotify(error, {
         message: `Error searching locations list`,
      }),
}

type GetKeyOptions = {
   searchValue: string
   limit?: number
   initialLocationIds?: string[]
}
const getKey = (options: GetKeyOptions) => {
   const { searchValue, limit, initialLocationIds } = options

   return searchValue?.length || initialLocationIds?.length
      ? [
           FUNCTION_NAMES.searchLocations,
           { searchValue, limit, initialLocationIds },
        ]
      : null
}

type Options = {
   suspense?: boolean
   limit?: number
   /**
    * When provided, the locations with the ids are always included in the results.
    * Regardless of the search value.
    */
   initialLocationIds?: string[]
}

/**
 * @description Calls function, searching for locations, according to the search value (debounced).
 * @param searchValue - The search value to search for.
 * @param suspense - Whether to suspend the component.
 */
export const useLocationSearch = (
   searchValue: string,
   options: Options = {}
) => {
   const { suspense = true, limit = 10, initialLocationIds } = options

   const fetcher = useFunctionsSWR<OptionGroup[]>()

   const [debouncedSearchValue, setDebouncedSearchValue] = useState("")

   useDebounce(
      () => {
         setDebouncedSearchValue(searchValue)
      },
      DEBOUNCE_MS,
      [searchValue]
   )

   return useSWR<Omit<OptionGroup, "groupId">[]>(
      getKey({ searchValue: debouncedSearchValue, limit, initialLocationIds }),
      fetcher,
      {
         ...swrOptions,
         suspense,
      }
   )
}

export const dropdownValueMapper = (
   option: OptionGroup
): { id: string; value: string } => {
   return {
      id: option.id,
      value: option.name,
   }
}
