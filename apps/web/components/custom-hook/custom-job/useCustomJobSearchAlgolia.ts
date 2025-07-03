import { SearchResponse } from "@algolia/client-search"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   ArrayFilterFieldType,
   BooleanFilterFieldType,
   CustomJobReplicaType,
} from "@careerfairy/shared-lib/customJobs/search"
import algoliaRepo from "data/algolia/AlgoliaRepository"
import { useCallback } from "react"
import useSWRInfinite from "swr/infinite"
import { AlgoliaCustomJobResponse, CustomJobSearchResult } from "types/algolia"
import { errorLogAndNotify, isTestEnvironment } from "util/CommonUtil"
import {
   createAlgoliaSearchResponse,
   deserializeAlgoliaSearchResponse,
   generateArrayFilterString,
   generateBooleanFilterStrings,
} from "util/algolia"

type Data = SearchResponse<AlgoliaCustomJobResponse> & {
   deserializedHits: CustomJobSearchResult[]
}

type Key = [
   "searchCustomJobs",
   string,
   string,
   number,
   CustomJobReplicaType,
   number
]

export type FilterOptions = {
   arrayFilters?: Partial<Record<ArrayFilterFieldType, string[]>>
   excludeArrayFilters?: Partial<Record<ArrayFilterFieldType, string[]>>
   booleanFilters?: Partial<Record<BooleanFilterFieldType, boolean | undefined>>
}

/**
 * Builds an Algolia filter string based on the provided options.
 * @param {Object} options - The filters to apply.
 * @returns {string} The constructed filter string.
 */
export const buildAlgoliaFilterString = (options: FilterOptions): string => {
   const filters = []

   const { arrayFilters, booleanFilters, excludeArrayFilters } = options

   const arrayFiltersString = generateArrayFilterString(arrayFilters, false, {
      normalizeFilterValues: true,
   })
   // Handle arrayFilters
   filters.push(arrayFiltersString)

   // Handle booleanFilters
   filters.push(generateBooleanFilterStrings(booleanFilters))

   // Handle excludeArrayFilters
   filters.push(generateArrayFilterString(excludeArrayFilters, true))

   return filters.filter(Boolean).join(" AND ")
}

type Options = {
   filterOptions: FilterOptions
   targetReplica?: CustomJobReplicaType
   disable?: boolean
   itemsPerPage?: number
   initialData?: CustomJob[]
}

/**
 * A custom React hook used for performing searches of companies in Algolia.
 * @param  inputValue - The search string input by the user
 * @param  options - The filter options to apply to the search
 */
export const useCustomJobSearchAlgolia = (
   inputValue: string,
   options?: Options
) => {
   const { filterOptions, targetReplica, disable, itemsPerPage, initialData } =
      options

   const fallbackData = initialData
      ? createAlgoliaSearchResponse<
           CustomJob,
           AlgoliaCustomJobResponse,
           CustomJobSearchResult
        >(initialData)
      : undefined

   const getKey = useCallback(
      (pageIndex: number, previousPageData: Data | null): Key => {
         // If reached the end of the list, return null to stop fetching
         if (previousPageData && !previousPageData.hits.length) return null
         return [
            "searchCustomJobs",
            inputValue,
            buildAlgoliaFilterString(filterOptions),
            pageIndex,
            targetReplica,
            itemsPerPage,
         ]
      },
      [inputValue, filterOptions, targetReplica, itemsPerPage]
   )

   const fetcher = async (key: Key): Promise<Data> => {
      const [, inputValue, filters, page, replica, pageLimit] = key
      const result = await algoliaRepo.searchCustomJobs(
         inputValue,
         filters,
         page,
         replica,
         pageLimit
      )

      return {
         ...result,
         deserializedHits: result.hits.map(deserializeAlgoliaSearchResponse),
      }
   }

   return useSWRInfinite<Data>(disable ? null : getKey, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Error fetching custom jobs",
            key,
         }),
      keepPreviousData: true,
      fallbackData: fallbackData,
      refreshInterval: isTestEnvironment() ? 1000 : undefined,
   })
}
