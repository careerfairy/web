import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { getStreamerDisplayName } from "components/views/streaming-page/util"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"
import { useStreamerDetails } from "../useStreamerDetails"

const getKey = (livestreamId: string, agoraUserId: string) => {
   if (!livestreamId || !agoraUserId) {
      return null
   }
   return `update-hand-raise-${livestreamId}-${agoraUserId}`
}

/**
 * Custom hook for updating the hand raise state of a user in a livestream.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  agoraUserId - The Agora user ID of the participant.
 * @param  displayName - The display name of the participant.
 * @param  newState - The new state of the hand raise.
 */
export const useUpdateUserHandRaiseState = (
   livestreamId: string,
   agoraUserId: string,
   newState: HandRaiseState
) => {
   const { errorNotification } = useSnackbarNotifications()
   const { data: streamerDetails } = useStreamerDetails(agoraUserId)

   const fetcher = async () =>
      livestreamService.setUserHandRaiseState(
         livestreamId,
         agoraUserId,
         getStreamerDisplayName(
            streamerDetails.firstName,
            streamerDetails.lastName
         ),
         newState
      )

   return useSWRMutation(getKey(livestreamId, agoraUserId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to update hand raise state in livestream",
            {
               key,
               livestreamId,
               agoraUserId,
            }
         )
      },
   })
}
