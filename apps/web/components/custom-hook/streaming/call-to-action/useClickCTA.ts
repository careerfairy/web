import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   void
>

const getKey = (livestreamId: string, ctaId: string) => {
   if (!ctaId || !livestreamId) {
      return null
   }
   return `click-cta-${livestreamId}-${ctaId}`
}

/**
 * Custom hook for updating the CTA data when clicking on it.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  ctaId - The ID of the CTA clicked.
 * @param  userIdentifier - The ID of the user who clicked.
 * @returns An object containing the mutation function to click a CTA and its related SWR mutation state.
 */
export const useClickCTA = (
   livestreamId: string,
   ctaId: string,
   userIdentifier: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher: FetcherType = async () =>
      livestreamService.clickCTA(livestreamId, ctaId, userIdentifier)

   return useSWRMutation(getKey(livestreamId, ctaId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to click CTA", {
            key,
            livestreamId,
            ctaId,
         })
      },
   })
}
