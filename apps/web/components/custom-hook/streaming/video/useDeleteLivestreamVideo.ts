import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

export const useDeleteLivestreamVideo = (livestreamId: string) => {
   const fetcher = async () => {
      await livestreamService.removeLivestreamVideo(livestreamId)
   }

   return useSWRMutation(
      livestreamId ? ["deleteVideo", livestreamId] : null,
      fetcher,
      {
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Error deleting video",
               key,
            })
         },
      }
   )
}
