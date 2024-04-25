import { UpdateLivestreamPollRequest } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import useSnackbarNotifications from "../useSnackbarNotifications"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   Omit<UpdateLivestreamPollRequest, "livestreamId" | "entryId"> // The entry ID to delete
>

const getKey = (livestreamId: string, pollId: string) => {
   if (!pollId || !livestreamId) {
      return null
   }
   return `stop-poll-${livestreamId}-${pollId}`
}

/**
 * Custom hook for stopping a specific livestream poll.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  pollId - The ID of the poll to stop.
 * @param  livestreamToken - The token for authenticating the livestream action.
 * @returns An object containing the mutation function to stop a poll and its related SWR mutation state.
 */
export const useStopLivestreamPoll = (
   livestreamId: string,
   pollId: string,
   livestreamToken: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher: FetcherType = async () =>
      livestreamService.updatePoll({
         livestreamId,
         livestreamToken,
         pollId,
         state: "closed",
      })

   return useSWRMutation(getKey(livestreamId, pollId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to stop poll from livestream", {
            key,
            livestreamId,
            pollId,
         })
      },
   })
}
