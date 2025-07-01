import { livestreamService } from "data/firebase/LivestreamService"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Fetches a single livestream or draft event by ID using SWR.
 * @param eventId The ID of the event (livestream or draft)
 * @returns SWR response for the event (targetStream and typeOfStream)
 */
export const useLivestreamOrDraft = (eventId?: string) => {
   return useSWR(
      eventId ? `targetEvent-${eventId}` : null,
      () => livestreamService.findTargetEvent(eventId!),
      {
         revalidateOnFocus: false,
         revalidateOnReconnect: false,
         onError: (error) => {
            errorLogAndNotify(error, {
               title: "Error fetching target event",
            })
         },
      }
   )
}
