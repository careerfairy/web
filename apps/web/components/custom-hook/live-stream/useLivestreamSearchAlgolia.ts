import algoliaRepo from "data/algolia/AlgoliaRepository"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import {
   AlgoliaLivestreamResponse,
   DateFilterFieldType,
   LivestreamSearchResult,
} from "types/algolia"
import { SearchResponse } from "@algolia/client-search"
import { useState } from "react"
import { useDebounce } from "react-use"
import {
   deserializeAlgoliaSearchResponse,
   generateArrayFilterString,
   generateBooleanFilterStrings,
   generateDateFilter,
} from "util/algolia"
import {
   ArrayFilterFieldType,
   BooleanFilterFieldType,
} from "@careerfairy/shared-lib/livestreams/search"

type Data = SearchResponse<AlgoliaLivestreamResponse> & {
   deserializedHits: LivestreamSearchResult[]
}

export type FilterOptions = {
   arrayFilters?: Partial<Record<ArrayFilterFieldType, string[]>>
   booleanFilters?: Partial<Record<BooleanFilterFieldType, boolean | undefined>>
   dateFilter?:
      | "future"
      | "past"
      | DateFilterFieldType<AlgoliaLivestreamResponse>
}

/**
 * Generates a date filter string for Algolia search based on the provided date filter options.
 * @param {FilterOptions['dateFilter']} dateFilter - The date filter option.
 * @returns {string} The generated date filter string.
 */
const generateDateFilterString = (
   dateFilter: FilterOptions["dateFilter"]
): string => {
   let filterString = ""

   if (!dateFilter) return filterString

   switch (dateFilter) {
      case "future":
         filterString = generateDateFilter("start._seconds", new Date(), null)
         break
      case "past":
         filterString = generateDateFilter(
            "start._seconds",
            new Date(0),
            new Date()
         )
         break
      default:
         filterString = generateDateFilter(
            dateFilter.attribute,
            dateFilter.startDate,
            dateFilter.endDate
         )
         break
   }

   return filterString
}

/**
 * Builds an Algolia filter string based on the provided options.
 * @param {Object} options - The filters to apply.
 * @returns {string} The constructed filter string.
 */
const buildAlgoliaFilterString = (options: FilterOptions): string => {
   const filters = []

   const { arrayFilters, booleanFilters, dateFilter } = options

   // Handle arrayFilters
   filters.push(generateArrayFilterString(arrayFilters))

   // Handle booleanFilters
   filters.push(generateBooleanFilterStrings(booleanFilters))

   filters.push(generateDateFilterString(dateFilter))

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
   options: FilterOptions,
   disable?: boolean
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
      disable
         ? null
         : `search-livestreams-input-${debouncedSearch.inputValue}-filters-${debouncedSearch.filters}`,
      async () => {
         if (!debouncedSearch.inputValue && !debouncedSearch.filters)
            return null

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
