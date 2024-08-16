import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"
import useSnackbarNotifications from "../../useSnackbarNotifications"

const getKey = (livestreamId: string, ctaId: string) => {
   if (!ctaId || !livestreamId) {
      return null
   }
   return `toggle-active-CTA-${livestreamId}-${ctaId}`
}

/**
 * Custom hook for toggling the CTA active state on a specific live stream.
 *
 * @param  livestreamId - The ID of the live stream.
 * @param  ctaId - The ID of the CTA to toggle active.
 * @param  livestreamToken - The token for authenticating the live stream action.
 * @returns An object containing the mutation function to toggle the CTA active state and its related SWR mutation state.
 */
export const useToggleActiveCTA = (
   livestreamId: string,
   ctaId: string,
   livestreamToken: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = () =>
      livestreamService.toggleActiveCTA({
         livestreamId,
         livestreamToken,
         ctaId,
      })

   return useSWRMutation(getKey(livestreamId, ctaId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to toggle active call to action in live stream",
            {
               key,
               ctaId,
               livestreamId,
            }
         )
      },
   })
}
