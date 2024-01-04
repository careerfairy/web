import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import algoliaRepo from "data/algolia/AlgoliaRepository"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { UseSearchOptions } from "../utils/useSearch"

/**
 * A custom React hook used for performing searches of livestream events in Firestore.
 *
 * @param {string} inputValue - The search string input by the user
 * @param {Options} options - Additional options to apply to the search
 * @param {number} options.maxResults - The maximum number of results to return (default: 5)
 * @param {number} options.debounceMs - The number of milliseconds to debounce the search (default: 500)
 */
export function useLivestreamSearchAlgolia(
   inputValue: string,
   options?: UseSearchOptions<LivestreamEvent>
) {
   return useSWR(
      `search-livestreams-${inputValue}`,
      async () => {
         return algoliaRepo.searchLivestreams(inputValue)
      },
      {
         onError: errorLogAndNotify,
      }
   )
}
