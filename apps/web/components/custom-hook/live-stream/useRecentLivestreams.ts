import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

/**
 * Custom hook to fetch recent past livestreams
 * @param limit - Number of recent livestreams to fetch (default: 9)
 * @returns Recent livestreams data
 */
export const useRecentLivestreams = (limit: number = 9) => {
   // Temporary minimal implementation for testing
   return {
      data: [] as LivestreamEvent[],
      isLoading: false,
   }
}