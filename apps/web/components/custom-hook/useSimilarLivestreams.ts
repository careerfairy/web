import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useMemo } from "react"
import useListenToStreams from "./useListenToStreams"

type Config = {
   limit?: FirebaseInArrayLimit
   currentLivestream: LivestreamEvent
}

/**
 * Hook to get similar livestreams based on company industry.
 * Works for both logged in and logged out users.
 * Shows livestreams from companies in the same industry as the current livestream.
 */
const useSimilarLivestreams = (config: Config) => {
   const { limit = 4, currentLivestream } = config

   // Get the industries from the current livestream
   const companyIndustries = currentLivestream.companyIndustries || []

   // Use the existing useListenToStreams hook with industry filtering
   const allSimilarStreams = useListenToStreams({
      companyIndustriesIds:
         companyIndustries.length > 0 ? companyIndustries : undefined,
      limit: limit + 1, // Get one extra to filter out current livestream
   })

   // Filter out the current livestream and limit results
   const similarStreams = useMemo(() => {
      if (!allSimilarStreams) return []

      return allSimilarStreams
         .filter((stream) => stream.id !== currentLivestream.id)
         .slice(0, limit)
   }, [allSimilarStreams, currentLivestream.id, limit])

   return useMemo(
      () => ({
         events: similarStreams,
         loading: false, // useListenToStreams doesn't provide loading state
      }),
      [similarStreams]
   )
}

export default useSimilarLivestreams
