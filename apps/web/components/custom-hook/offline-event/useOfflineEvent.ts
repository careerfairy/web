import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { offlineEventService } from "data/firebase/OfflineEventService"
import useSWR from "swr"

/**
 * Custom hook to fetch an offline event by id using SWR and OfflineEventService
 * @param eventId - The id of the offline event
 * @param initialData - Optional initial data for SSR or optimistic UI
 */
export const useOfflineEvent = (
   eventId: string,
   initialData?: OfflineEvent | null
) => {
   return useSWR<OfflineEvent | null>(
      eventId ? ["offline-event", eventId] : null,
      () => offlineEventService.getById(eventId),
      {
         fallbackData: initialData ?? undefined,
         revalidateOnFocus: true,
      }
   )
}
