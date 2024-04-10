import { DeleteLivestreamChatEntryRequest } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import useSnackbarNotifications from "../useSnackbarNotifications"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   Omit<DeleteLivestreamChatEntryRequest, "livestreamId"> // The entry ID to delete
>

/**
 * Custom hook for deleting a specific livestream chat entry or all entries of a livestream.
 *
 * @param {string} livestreamId - The ID of the livestream.
 * @returns An object containing the mutation function to delete a chat entry or all chat entries and its related SWR mutation state.
 */
export const useDeleteLivestreamChatEntry = (livestreamId: string) => {
   const { errorNotification } = useSnackbarNotifications()
   const fetcher: FetcherType = async (_, options) =>
      livestreamService.deleteChatEntry({
         ...options.arg,
         livestreamId,
      })

   return useSWRMutation(`delete-chat-entry-${livestreamId}`, fetcher, {
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
