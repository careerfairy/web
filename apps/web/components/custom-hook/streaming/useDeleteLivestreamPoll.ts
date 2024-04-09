import { DeleteLivestreamPollRequest } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import useSnackbarNotifications from "../useSnackbarNotifications"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   Omit<DeleteLivestreamPollRequest, "livestreamId" | "entryId"> // The entry ID to delete
>

const getKey = (livestreamId: string, pollId: string) => {
   if (!pollId || !livestreamId) {
      return null
   }
   return `delete-poll-${livestreamId}-${pollId}`
}

/**
 * Custom hook for deleting a specific livestream poll.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  pollId - The ID of the poll to delete.
 * @param  livestreamToken - The token for authenticating the livestream action.
 * @returns An object containing the mutation function to delete a poll and its related SWR mutation state.
 */
export const useDeleteLivestreamPoll = (
   livestreamId: string,
   pollId: string,
   livestreamToken: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher: FetcherType = async () =>
      livestreamService.deletePoll({
         livestreamId,
         livestreamToken,
         pollId,
      })

   return useSWRMutation(getKey(livestreamId, pollId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to delete poll from livestream", {
            key,
            livestreamId,
            pollId,
         })
      },
   })
}
