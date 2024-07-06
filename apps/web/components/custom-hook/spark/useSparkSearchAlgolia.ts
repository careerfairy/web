import { SearchResponse } from "@algolia/client-search"
import {
   ArrayFilterFieldType,
   BooleanFilterFieldType,
   SparkReplicaType,
} from "@careerfairy/shared-lib/sparks/search"
import algoliaRepo from "data/algolia/AlgoliaRepository"
import { useCallback } from "react"
import useSWRInfinite from "swr/infinite"
import { AlgoliaSparkResponse, SparkSearchResult } from "types/algolia"
import { errorLogAndNotify, isTestEnvironment } from "util/CommonUtil"
import {
   deserializeAlgoliaSearchResponse,
   generateArrayFilterString,
   generateBooleanFilterStrings,
} from "util/algolia"

type Data = SearchResponse<AlgoliaSparkResponse> & {
   deserializedHits: SparkSearchResult[]
}

type Key = ["searchSparks", string, string, number, number, SparkReplicaType]

export type FilterOptions = {
   arrayFilters?: Partial<Record<ArrayFilterFieldType, string[]>>
   booleanFilters?: Partial<Record<BooleanFilterFieldType, boolean | undefined>>
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

/**
 * A custom React hook used for performing searches of sparks in Algolia.
 * @param  inputValue - A custom search input, checked against the Algolia index filterable fields.
 * @param  options - The filter options to apply to the search (array and boolean filters) with other type of filters also able to be defined.
 * @param limit Limit of items to fetch, defines the Algolia item per page.
 * @param targetReplica Replica to target, for Sparks the most applicable replica is sorted by publishedAt descending, matching in this way the sparks feed
 * ordering of sparks as well.
 * @param disable Optional parameter for disabling the data fetch,
 */
export function useSparkSearchAlgolia(
   inputValue: string,
   options: FilterOptions,
   limit: number,
   targetReplica?: SparkReplicaType,
   disable?: boolean
) {
   const getKey = useCallback(
      (pageIndex: number, previousPageData: Data | null): Key => {
         // If reached the end of the list, return null to stop fetching
         if (previousPageData && !previousPageData.hits.length) return null
         return [
            "searchSparks",
            inputValue,
            buildAlgoliaFilterString(options),
            pageIndex,
            limit,
            targetReplica,
         ]
      },
      [inputValue, options, targetReplica, limit]
   )

   const fetcher = async (key: Key): Promise<Data> => {
      const [, inputValue, filters, page, itemsPerPage, replica] = key
      const result = await algoliaRepo.searchSparks(
         inputValue,
         filters,
         page,
         replica,
         itemsPerPage
      )

      return {
         ...result,
         deserializedHits: result.hits.map(deserializeAlgoliaSearchResponse),
      }
   }

   return useSWRInfinite<Data>(disable ? null : getKey, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Error fetching sparks via Algolia",
            key,
         }),
      keepPreviousData: true,
      refreshInterval: isTestEnvironment() ? 1000 : undefined,
   })
}
