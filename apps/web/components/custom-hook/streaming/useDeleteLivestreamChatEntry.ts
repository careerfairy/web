import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   string // The entry ID to delete
>

/**
 * Custom hook for deleting a livestream chat entry.
 *
 * @param {string} livestreamId - The ID of the livestream.
 * @returns An object containing the mutation function to delete a chat entry and its related SWR mutation state.
 */
export const useDeleteLivestreamChatEntry = (livestreamId: string) => {
   const fetcher: FetcherType = async (_, options) =>
      livestreamService.deleteChatEntry(livestreamId, options.arg)

   return useSWRMutation(`delete-chat-entry-${livestreamId}`, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Failed to delete chat entry from livestream",
            key,
         }),
   })
}
