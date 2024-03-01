import algoliaRepo from "data/algolia/AlgoliaRepository"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import {
   AlgoliaLivestreamResponse,
   LivestreamSearchResult,
} from "types/algolia"
import { SearchResponse } from "@algolia/client-search"
import { useState } from "react"
import { useDebounce } from "react-use"
import { deserializeAlgoliaSearchResponse } from "util/algolia"
import {
   ArrayFilterFieldType,
   BooleanFilterFieldType,
} from "@careerfairy/shared-lib/livestreams/search"

type Data = SearchResponse<AlgoliaLivestreamResponse> & {
   deserializedHits: LivestreamSearchResult[]
}

export type FilterOptions = {
   arrayFilters: Partial<Record<ArrayFilterFieldType, string[]>>
   booleanFilters: Partial<Record<BooleanFilterFieldType, boolean | undefined>>
}

/**
 * Generates a filter string for arrayInFilters.
 * @param {Record<string, string[]>} arrayFilters - The array filters to apply.
 * @returns {string} The constructed filter string.
 */
const generateArrayFilterString = (
   arrayFilters: Record<string, string[]>
): string => {
   if (!arrayFilters) return ""
   const filters = []
   Object.entries(arrayFilters).forEach(([filterName, filterValues]) => {
      if (filterValues && filterValues.length > 0) {
         filterValues.forEach((filterValue) => {
            if (filterValue) {
               filters.push(`${filterName}:${filterValue}`)
            }
         })
      }
   })

   return filters.join(" AND ")
}

/**
 * Generates filter strings for booleanFilters.
 * @param {Object} booleanFilters - The boolean filters to apply.
 * @returns {string[]} The constructed filter strings.
 */
const generateBooleanFilterStrings = (
   booleanFilters: Partial<Record<string, boolean | undefined>>
): string => {
   if (!booleanFilters) return ""
   return (
      Object.entries(booleanFilters)
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         .filter(([_, value]) => value !== undefined) // Filter out undefined values
         .map(([filterName, value]) => `${filterName}:${value}`)
         .join(" AND ")
   )
}

/**
 * Builds an Algolia filter string based on the provided options.
 * @param {Object} options - The filters to apply.
 * @returns {string} The constructed filter string.
 */
const buildAlgoliaFilterString = (options: FilterOptions): string => {
   const filters = []

   const { arrayFilters, booleanFilters } = options

   // Handle arrayFilters
   filters.push(generateArrayFilterString(arrayFilters))

   // Handle booleanFilters
   filters.push(generateBooleanFilterStrings(booleanFilters))

   return filters.filter(Boolean).join(" AND ")
}

type DebouncedSearch = {
   filters: string
   inputValue: string
}

/**
 * A custom React hook used for performing searches of livestream events in Algolia.
 * @param  inputValue - The search string input by the user
 * @param  options - The filter options to apply to the search
 */
export function useLivestreamSearchAlgolia(
   inputValue: string,
   options: FilterOptions
) {
   const filters = buildAlgoliaFilterString(options)

   const [debouncedSearch, setDebouncedSearch] = useState<DebouncedSearch>({
      filters,
      inputValue,
   })

   useDebounce(
      () => {
         setDebouncedSearch({
            filters,
            inputValue,
         })
      },
      500,
      [inputValue]
   )

   return useSWR<Data>(
      `search-livestreams-input-${debouncedSearch.inputValue}-filters-${debouncedSearch.filters}`,
      async () => {
         if (!debouncedSearch.inputValue && !debouncedSearch.filters)
            return null

         console.log(
            "🚀 ~ file: useLivestreamSearchAlgolia.ts:129 ~ debouncedSearch.filters:",
            debouncedSearch.filters
         )
         const result = await algoliaRepo.searchLivestreams(
            debouncedSearch.inputValue,
            debouncedSearch.filters
         )
         return {
            ...result,
            deserializedHits: result.hits.map(deserializeAlgoliaSearchResponse),
         }
      },
      {
         onError: errorLogAndNotify,
      }
   )
}
