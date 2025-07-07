import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LIVESTREAM_REPLICAS } from "@careerfairy/shared-lib/livestreams/search"
import { useLivestreamSearchAlgolia } from "./useLivestreamSearchAlgolia"

/**
 * Custom hook to fetch recent past livestreams
 * @param limit - Number of recent livestreams to fetch (default: 9)
 * @returns Recent livestreams data
 */
export const useRecentLivestreams = (limit: number = 9) => {
   const { data, isValidating } = useLivestreamSearchAlgolia(
      "",
      {
         arrayFilters: {},
         booleanFilters: {
            hidden: false,
            hasEnded: true,
         },
         dateFilter: "past",
      },
      LIVESTREAM_REPLICAS.START_DESC,
      undefined,
      limit
   )

   const recentLivestreams = data?.flatMap((page) => page.deserializedHits) || []

   return {
      data: recentLivestreams.slice(0, limit) as LivestreamEvent[],
      isLoading: isValidating,
   }
}