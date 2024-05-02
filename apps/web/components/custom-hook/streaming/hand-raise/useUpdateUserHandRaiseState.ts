import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { getStreamerDisplayName } from "components/views/streaming-page/util"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { useStreamerDetails } from "../useStreamerDetails"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   HandRaiseState
>

const getKey = (livestreamId: string, handRaiseId: string) => {
   if (!livestreamId || !handRaiseId) {
      return null
   }
   return `update-hand-raise-${livestreamId}-${handRaiseId}`
}

/**
 * Custom hook for updating the hand raise state of a user in a livestream.
 * @param  livestreamId - The ID of the livestream.
 * @param  handRaiseId - The ID of the hand raise.
 */
export const useUpdateUserHandRaiseState = (
   livestreamId: string,
   handRaiseId: string
) => {
   const { errorNotification } = useSnackbarNotifications()
   const { data: streamerDetails } = useStreamerDetails(handRaiseId)

   const fetcher: FetcherType = async (_, options) =>
      livestreamService.setUserHandRaiseState(
         livestreamId,
         handRaiseId,
         getStreamerDisplayName(
            streamerDetails.firstName,
            streamerDetails.lastName
         ),
         options.arg
      )

   return useSWRMutation(getKey(livestreamId, handRaiseId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to update hand raise state in livestream",
            {
               key,
               livestreamId,
               handRaiseId,
            }
         )
      },
   })
}
