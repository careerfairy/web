import { useCallback, useEffect, useState } from "react"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"

/**
 *  To get events for the specific fields of studies
 *  If {fallbackToGeneralStreams} is true, show generic events
 */
const useUpcomingStreamsByFieldOfStudy = (
   fieldsOfStudy: FieldOfStudy[],
   fallbackToGeneralStreams?: boolean
) => {
   const [events, setEvents] = useState<LivestreamEvent[]>([])
   const [loading, setLoading] = useState(true)

   /**
    *  Get the generic Upcoming Events
    */
   const getGeneralUpcomingStreams = useCallback((limit: number) => {
      livestreamRepo
         .getUpcomingEvents(limit)
         .then((events: LivestreamEvent[]) => {
            if (events?.length) {
               setEvents(events)
            }
         })
         .catch(console.error)
   }, [])

   useEffect(() => {
      setLoading(true)
      const limit = 10

      livestreamRepo
         .getUpcomingEventsByFieldsOfStudy(fieldsOfStudy, limit)
         .then((events: LivestreamEvent[]) => {
            if (events?.length) {
               setEvents(events)
            } else if (!events?.length && fallbackToGeneralStreams) {
               getGeneralUpcomingStreams(limit)
            }
         })
         .catch(console.error)
         .finally(() => setLoading(false))
   }, [fallbackToGeneralStreams, fieldsOfStudy, getGeneralUpcomingStreams])

   return { events, loading }
}
export default useUpcomingStreamsByFieldOfStudy
