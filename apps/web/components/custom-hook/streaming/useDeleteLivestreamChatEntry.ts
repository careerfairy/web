import { DeleteLivestreamChatEntryRequest } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import useSnackbarNotifications from "../useSnackbarNotifications"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   Omit<DeleteLivestreamChatEntryRequest, "livestreamId" | "entryId"> // The entry ID to delete
>

const getKey = (livestreamId: string, entryId: string) => {
   if (!entryId || !livestreamId) {
      return null
   }
   return `delete-chat-entry-${livestreamId}-${entryId}`
}

/**
 * Custom hook for deleting a specific livestream chat entry.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  entryId - The ID of the chat entry to delete.
 * @returns An object containing the mutation function to delete a chat entry and its related SWR mutation state.
 */
export const useDeleteLivestreamChatEntry = (
   livestreamId: string,
   entryId: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher: FetcherType = async (_, options) =>
      livestreamService.deleteChatEntry({
         ...options.arg,
         livestreamId,
         entryId,
      })

   return useSWRMutation(getKey(livestreamId, entryId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to delete chat entry from livestream",
            {
               key,
            }
         )
      },
   })
}
