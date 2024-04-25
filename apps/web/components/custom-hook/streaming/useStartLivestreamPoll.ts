import { MarkLivestreamPollAsCurrentRequest } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import useSnackbarNotifications from "../useSnackbarNotifications"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   Omit<MarkLivestreamPollAsCurrentRequest, "livestreamId" | "entryId"> // The entry ID to delete
>

const getKey = (livestreamId: string, pollId: string) => {
   if (!pollId || !livestreamId) {
      return null
   }
   return `start-poll-${livestreamId}-${pollId}`
}

/**
 * Custom hook for starting a specific livestream poll.
 *
 * Sets all current polls for a livestream to be closed and marks the specified poll as the current poll.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  pollId - The ID of the poll to start.
 * @param  livestreamToken - The token for authenticating the livestream action.
 */
export const useStartLivestreamPoll = (
   livestreamId: string,
   pollId: string,
   livestreamToken: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher: FetcherType = async () =>
      livestreamService.markPollAsCurrent({
         livestreamId,
         livestreamToken,
         pollId,
      })

   return useSWRMutation(getKey(livestreamId, pollId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to start poll from livestream", {
            key,
            livestreamId,
            pollId,
         })
      },
   })
}
