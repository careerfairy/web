import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import useSnackbarNotifications from "../useSnackbarNotifications"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   {
      optionId: string
   }
>

const getKey = (livestreamId: string, pollId: string) => {
   if (!pollId || !livestreamId) {
      return null
   }
   return `vote-poll-option-${livestreamId}-${pollId}`
}

/**
 * Custom hook for voting on a specific livestream poll.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  pollId - The ID of the poll to vote on.
 * @param  livestreamToken - The token for authenticating the livestream action.
 * @returns An object containing the mutation function to vote on a poll and its related SWR mutation state.
 */
export const useVoteLivestreamPollOption = (
   livestreamId: string,
   pollId: string,
   userIdentifier: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher: FetcherType = async (_, opts) =>
      livestreamService.votePollOption(
         livestreamId,
         pollId,
         opts.arg.optionId,
         userIdentifier
      )

   return useSWRMutation(getKey(livestreamId, pollId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to vote poll option", {
            key,
            livestreamId,
            pollId,
         })
      },
   })
}
