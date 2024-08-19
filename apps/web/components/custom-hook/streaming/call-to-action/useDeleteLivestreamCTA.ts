import { DeleteLivestreamCTARequest } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import useSnackbarNotifications from "../../useSnackbarNotifications"

type FetcherType = MutationFetcher<
   void, // return type
   unknown, // error type
   Omit<DeleteLivestreamCTARequest, "livestreamId" | "entryId"> // The entry ID to delete
>

const getKey = (livestreamId: string, ctaId: string) => {
   if (!ctaId || !livestreamId) {
      return null
   }
   return `delete-CTA-${livestreamId}-${ctaId}`
}

/**
 * Custom hook for deleting a specific livestream CTA.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  ctaId - The ID of the CTA to delete.
 * @param  livestreamToken - The token for authenticating the livestream action.
 * @returns An object containing the mutation function to delete a CTA and its related SWR mutation state.
 */
export const useDeleteLivestreamCTA = (
   livestreamId: string,
   ctaId: string,
   livestreamToken: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher: FetcherType = async () =>
      livestreamService.deleteCTA({
         livestreamId,
         livestreamToken,
         ctaId,
      })

   return useSWRMutation(getKey(livestreamId, ctaId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to delete call to action from livestream",
            {
               key,
               livestreamId,
               ctaId,
            }
         )
      },
   })
}
