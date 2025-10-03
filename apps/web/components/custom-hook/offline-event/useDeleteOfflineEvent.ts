import useSWRMutation from "swr/mutation"
import { offlineEventService } from "../../../data/firebase/OfflineEventService"

interface UseDeleteOfflineEventOptions {
   offlineEventId: string | undefined
   groupId: string | undefined
}

/**
 * Custom hook for deleting an offline event.
 *
 * @param options - The options for deleting the offline event
 * @returns An object containing the SWR mutation trigger function and state.
 */
export const useDeleteOfflineEvent = (
   options: UseDeleteOfflineEventOptions
) => {
   const key =
      options.offlineEventId && options.groupId
         ? `delete-offline-event-${options.offlineEventId}`
         : null

   const fetcher = async () => {
      if (!options.offlineEventId) {
         throw new Error("Offline event ID is required")
      }
      return offlineEventService.deleteOfflineEvent(options.offlineEventId)
   }

   return useSWRMutation(key, fetcher)
}
