import { recordingsService } from "data/firebase/RecordingsService"
import useSWR from "swr"

const fetcher = async (livestreamId: string) => {
   return await recordingsService.fetchRecordingViews(livestreamId)
}

export const useRecordingViewsSWR = (livestreamId: string) => {
   const { data, error, isLoading } = useSWR(
      livestreamId ? ["recording-views", livestreamId] : null,
      () => fetcher(livestreamId)
   )

   return {
      uniqueViewers: data?.uniqueViewers ?? 0,
      totalViews: data?.totalViews ?? 0,
      loading: isLoading,
      error,
   }
}
