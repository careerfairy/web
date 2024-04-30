import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"

const getKey = (livestreamId: string) => {
   if (!livestreamId) {
      return null
   }
   return `toggle-hand-raise-${livestreamId}`
}

/**
 * Custom hook for toggling the hand raise state in a livestream.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  livestreamToken - The token for authenticating the livestream action.
 */
export const useToggleHandRaise = (
   livestreamId: string,
   livestreamToken: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = async () =>
      livestreamService.toggleHandRaise({
         livestreamId,
         livestreamToken,
      })

   return useSWRMutation(getKey(livestreamId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to toggle hand raise in livestream", {
            key,
            livestreamId,
         })
      },
   })
}
