import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useEffect, useState } from "react"
import { livestreamRepo } from "../../data/RepositoryInstances"

/**
 *  To get events for the specific fields of study
 *  If {fallbackToGeneralStreams} is true and no events for the specific fields of study, show generic events
 */
const useUpcomingStreamsByFieldOfStudy = (
   fieldsOfStudy: FieldOfStudy[],
   fallbackToGeneralStreams?: boolean,
   limit = 10
) => {
   const [events, setEvents] = useState<LivestreamEvent[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      setLoading(true)

      livestreamRepo
         .getUpcomingEventsByFieldsOfStudy(fieldsOfStudy, limit)
         .then((fieldOfStudyEvents: LivestreamEvent[]) => {
            if (fallbackToGeneralStreams) {
               if (!fieldOfStudyEvents) {
                  // return the generic Upcoming Events
                  return livestreamRepo.getUpcomingEvents(limit)
               }
               if (fieldOfStudyEvents?.length < limit) {
                  // return fields of study events, plus generic Upcoming Events
                  return livestreamRepo
                     .getUpcomingEvents(limit)
                     .then((generalUpcomingEvents) => {
                        // Add general upcoming events to the response without duplicating events
                        const fieldOfStudyEventsIds = fieldOfStudyEvents.map(
                           (event) => event.id
                        )
                        const filteredGeneralUpcomingEvents =
                           generalUpcomingEvents.filter(
                              (generalEvent) =>
                                 !fieldOfStudyEventsIds.includes(
                                    generalEvent.id
                                 )
                           )

                        return [
                           ...fieldOfStudyEvents,
                           ...filteredGeneralUpcomingEvents,
                        ]
                     })
               }
            }
            return fieldOfStudyEvents
         })
         .then((events: LivestreamEvent[]) => {
            if (events?.length) {
               setEvents(events)
            }
         })
         .catch(console.error)
         .finally(() => setLoading(false))
   }, [fallbackToGeneralStreams, fieldsOfStudy, limit])

   return { events, loading }
}
export default useUpcomingStreamsByFieldOfStudy
