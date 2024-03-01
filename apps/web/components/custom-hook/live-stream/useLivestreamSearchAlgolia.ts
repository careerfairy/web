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

type Data = SearchResponse<AlgoliaLivestreamResponse> & {
   deserializedHits: LivestreamSearchResult[]
}

/**
 * A custom React hook used for performing searches of livestream events in Algolia.
 * @param {string} inputValue - The search string input by the user
 * @param {number} options.maxResults - The maximum number of results to return (default: 5)
 * @param {number} options.debounceMs - The number of milliseconds to debounce the search (default: 500)
 */
export function useLivestreamSearchAlgolia(inputValue: string) {
   const [debouncedInput, setDebouncedInput] = useState("")

   useDebounce(
      () => {
         setDebouncedInput(inputValue)
      },
      500,
      [inputValue]
   )

   return useSWR<Data>(
      `search-livestreams-${debouncedInput}`,
      async () => {
         if (!debouncedInput) return null
         const result = await algoliaRepo.searchLivestreams(debouncedInput)
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
