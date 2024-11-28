import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { getStreamerDisplayName } from "components/views/streaming-page/util"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   {
      state: HandRaiseState
      handRaiseId: string
   }
>

const getKey = (livestreamId: string) => {
   if (!livestreamId) {
      return null
   }
   return `update-hand-raise-${livestreamId}`
}

/**
 * Custom hook for updating the hand raise state of a user in a live stream.
 * @param  livestreamId - The ID of the live stream.
 * @param  handRaiseId - The ID of the hand raise.
 */
export const useUpdateUserHandRaiseState = (livestreamId: string) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher: FetcherType = async (_, options) => {
      const streamerDetails = await livestreamService.getParticipantDetails(
         options.arg.handRaiseId
      )

      return livestreamService.setUserHandRaiseState(
         livestreamId,
         options.arg.handRaiseId,
         getStreamerDisplayName(
            streamerDetails.firstName,
            streamerDetails.lastName
         ),
         options.arg.state
      )
   }

   return useSWRMutation(getKey(livestreamId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to update hand raise state in live stream",
            {
               key,
               livestreamId,
            }
         )
      },
   })
}
