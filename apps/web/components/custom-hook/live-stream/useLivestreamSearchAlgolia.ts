import { SearchResponse } from "@algolia/client-search"
import { getEarliestEventBufferTime } from "@careerfairy/shared-lib/livestreams"
import {
   ArrayFilterFieldType,
   BooleanFilterFieldType,
   LivestreamReplicaType,
} from "@careerfairy/shared-lib/livestreams/search"
import algoliaRepo from "data/algolia/AlgoliaRepository"
import { DateTime } from "luxon"
import { useCallback } from "react"
import useSWRInfinite from "swr/infinite"
import {
   AlgoliaLivestreamResponse,
   DateFilterFieldType,
   LivestreamSearchResult,
} from "types/algolia"
import { errorLogAndNotify, isTestEnvironment } from "util/CommonUtil"
import {
   deserializeAlgoliaSearchResponse,
   generateArrayFilterString,
   generateBooleanFilterStrings,
   generateDateFilter,
} from "util/algolia"

type Data = SearchResponse<AlgoliaLivestreamResponse> & {
   deserializedHits: LivestreamSearchResult[]
}

type Key = ["searchLivestreams", string, string, number, LivestreamReplicaType]

export type FilterOptions = {
   arrayFilters?: Partial<Record<ArrayFilterFieldType, string[]>>
   booleanFilters?: Partial<Record<BooleanFilterFieldType, boolean | undefined>>
   dateFilter?:
      | "future"
      | "past"
      | DateFilterFieldType<AlgoliaLivestreamResponse>
}

const now = new Date()
const past = DateTime.local().minus({ months: 36 }).toJSDate()

const earliestEventBufferTime = getEarliestEventBufferTime()

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
         return generateDateFilter("startTimeMs", earliestEventBufferTime, null)
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
   targetReplica?: LivestreamReplicaType,
   disable?: boolean
) {
   const getKey = useCallback(
      (pageIndex: number, previousPageData: Data | null): Key => {
         // If reached the end of the list, return null to stop fetching
         if (previousPageData && !previousPageData.hits.length) return null
         return [
            "searchLivestreams",
            inputValue,
            buildAlgoliaFilterString(options),
            pageIndex,
            targetReplica,
         ]
      },
      [inputValue, options, targetReplica]
   )

   const fetcher = async (key: Key): Promise<Data> => {
      const [, inputValue, filters, page, replica] = key
      const result = await algoliaRepo.searchLivestreams(
         inputValue,
         filters,
         page,
         replica
      )
      return {
         ...result,
         deserializedHits: result.hits.map(deserializeAlgoliaSearchResponse),
      }
   }

   return useSWRInfinite<Data>(disable ? null : getKey, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Error fetching livestreams",
            key,
         }),
      keepPreviousData: true,
      refreshInterval: isTestEnvironment() ? 1000 : undefined,
   })
}
