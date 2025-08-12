import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useListenToStreams from "./useListenToStreams"

type Config = {
   limit?: FirebaseInArrayLimit
   currentLivestream: LivestreamEvent
}

const removeCurrentLivestream = (
   livestreams: LivestreamEvent[] | undefined,
   currentLivestream: LivestreamEvent
) => {
   return (
      livestreams?.filter((stream) => stream.id !== currentLivestream.id) || []
   )
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
      companyIndustriesIds: companyIndustries,
   })

   // Filter out the current livestream and limit results
   const events = removeCurrentLivestream(
      allSimilarStreams,
      currentLivestream
   ).slice(0, limit)

   return {
      events,
      loading: allSimilarStreams === undefined, // useListenToStreams returns undefined when loading
   }
}

export default useSimilarLivestreams
