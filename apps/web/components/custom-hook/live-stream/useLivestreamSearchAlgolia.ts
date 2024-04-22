import algoliaRepo from "data/algolia/AlgoliaRepository"
import useSWRInfinite from "swr/infinite"
import { errorLogAndNotify } from "util/CommonUtil"
import {
   AlgoliaLivestreamResponse,
   DateFilterFieldType,
   LivestreamSearchResult,
} from "types/algolia"
import { SearchResponse } from "@algolia/client-search"
import { useCallback } from "react"
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

const now = new Date()
const past = new Date(0)

/**
 * Generates a date filter string for Algolia search based on the provided date filter options.
 * @param {FilterOptions['dateFilter']} dateFilter - The date filter option.
 * @returns {string} The generated date filter string.
 */
const generateDateFilterString = (
   dateFilter: FilterOptions["dateFilter"]
): string => {
   if (!dateFilter) return ""

   switch (dateFilter) {
      case "future":
         return generateDateFilter("startTimeMs", now, null)
      case "past":
         return generateDateFilter("startTimeMs", past, now)
      default:
         return generateDateFilter(
            dateFilter.attribute,
            dateFilter.startDate,
            dateFilter.endDate
         )
   }
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
   const getKey = useCallback(
      (pageIndex: number, previousPageData: Data | null) => {
         // If reached the end of the list, return null to stop fetching
         if (previousPageData && !previousPageData.hits.length) return null
         return [
            "searchLivestreams",
            inputValue,
            buildAlgoliaFilterString(options),
            pageIndex,
         ]
      },
      [inputValue, options]
   )

   const fetcher = async (key): Promise<Data> => {
      const [, inputValue, filters, page] = key
      const result = await algoliaRepo.searchLivestreams(
         inputValue,
         filters,
         page
      )
      return {
         ...result,
         deserializedHits: result.hits.map(deserializeAlgoliaSearchResponse),
      }
   }

   return useSWRInfinite<Data>(disable ? null : getKey, fetcher, {
      onError: errorLogAndNotify,
      keepPreviousData: true,
   })
}
