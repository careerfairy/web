import { recordingsService } from "data/firebase/RecordingsService"
import useSWR from "swr"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

const fetcher = async (livestreamId: string) => {
   return await recordingsService.fetchRecordingViews(livestreamId)
}

const options = {
   ...reducedRemoteCallsOptions,
   suspense: false,
}

/**
 * React hook to get recording view statistics for a livestream.
 * Returns unique viewers, total views, loading state, and error.
 */
export const useRecordingViewsSWR = (livestreamId: string) => {
   const { data, error, isLoading } = useSWR(
      livestreamId ? ["recording-views", livestreamId] : null,
      () => fetcher(livestreamId),
      options
   )

   return {
      uniqueViewers: data?.uniqueViewers ?? 0,
      totalViews: data?.totalViews ?? 0,
      loading: isLoading,
      error,
   }
}
