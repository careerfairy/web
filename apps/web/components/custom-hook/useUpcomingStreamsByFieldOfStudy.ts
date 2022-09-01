import { useEffect, useState } from "react"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"

/**
 *  To get events for the specific fields of study
 *  If {fallbackToGeneralStreams} is true and no events for the specific fields of study, show generic events
 */
const useUpcomingStreamsByFieldOfStudy = (
   fieldsOfStudy: FieldOfStudy[],
   fallbackToGeneralStreams?: boolean
) => {
   const [events, setEvents] = useState<LivestreamEvent[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      setLoading(true)
      const limit = 10

      livestreamRepo
         .getUpcomingEventsByFieldsOfStudy(fieldsOfStudy, limit)
         .then((events: LivestreamEvent[]) => {
            if (!events?.length && fallbackToGeneralStreams) {
               // Get the generic Upcoming Events
               return livestreamRepo.getUpcomingEvents(limit)
            }

            return events
         })
         .then((events: LivestreamEvent[]) => {
            if (events?.length) {
               setEvents(events)
            }
         })
         .catch(console.error)
         .finally(() => setLoading(false))
   }, [fallbackToGeneralStreams, fieldsOfStudy])

   return { events, loading }
}
export default useUpcomingStreamsByFieldOfStudy
