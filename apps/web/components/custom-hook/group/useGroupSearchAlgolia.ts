import { SearchResponse } from "@algolia/client-search"
import { CompanyReplicaType } from "@careerfairy/shared-lib/groups/search"

import {
   ArrayFilterFieldType,
   BooleanFilterFieldType,
} from "@careerfairy/shared-lib/groups/search"
import algoliaRepo from "data/algolia/AlgoliaRepository"
import { useCallback } from "react"
import useSWRInfinite from "swr/infinite"
import { AlgoliaCompanyResponse, CompanySearchResult } from "types/algolia"
import { errorLogAndNotify, isTestEnvironment } from "util/CommonUtil"
import {
   deserializeAlgoliaSearchResponse,
   generateArrayFilterString,
   generateBooleanFilterStrings,
} from "util/algolia"

type Data = SearchResponse<AlgoliaCompanyResponse> & {
   deserializedHits: CompanySearchResult[]
}

type Key = [
   "searchCompanies",
   string,
   string,
   number,
   CompanyReplicaType,
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
const buildAlgoliaFilterString = (options: FilterOptions): string => {
   const filters = []

   const { arrayFilters, booleanFilters, excludeArrayFilters } = options

   // Handle arrayFilters
   filters.push(generateArrayFilterString(arrayFilters))

   // Handle booleanFilters
   filters.push(generateBooleanFilterStrings(booleanFilters))

   // Handle excludeArrayFilters
   filters.push(generateArrayFilterString(excludeArrayFilters, true))

   return filters.filter(Boolean).join(" AND ")
}

/**
 * A custom React hook used for performing searches of companies in Algolia.
 * @param  inputValue - The search string input by the user
 * @param  options - The filter options to apply to the search
 */
export function useCompanySearchAlgolia(
   inputValue: string,
   options: FilterOptions,
   targetReplica?: CompanyReplicaType,
   disable?: boolean,
   itemsPerPage?: number
) {
   const getKey = useCallback(
      (pageIndex: number, previousPageData: Data | null): Key => {
         // If reached the end of the list, return null to stop fetching
         if (previousPageData && !previousPageData.hits.length) return null
         return [
            "searchCompanies",
            inputValue,
            buildAlgoliaFilterString(options),
            pageIndex,
            targetReplica,
            itemsPerPage,
         ]
      },
      [inputValue, options, targetReplica, itemsPerPage]
   )

   const fetcher = async (key: Key): Promise<Data> => {
      const [, inputValue, filters, page, replica, pageLimit] = key
      const result = await algoliaRepo.searchCompanies(
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
            message: "Error fetching companies",
            key,
         }),
      keepPreviousData: true,
      refreshInterval: isTestEnvironment() ? 1000 : undefined,
   })
}
