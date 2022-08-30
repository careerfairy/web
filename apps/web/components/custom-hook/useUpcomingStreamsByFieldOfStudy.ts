import { useEffect, useState } from "react"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/marketing/MarketingUser"

const useUpcomingStreamsByFieldOfStudy = (fieldsOfStudy: FieldOfStudy[]) => {
   const [events, setEvents] = useState<LivestreamEvent[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      setLoading(true)
      livestreamRepo
         .getUpcomingEventsByFieldsOfStudy(
            fieldsOfStudy.map((el) => el.id),
            10
         )
         .then((events: LivestreamEvent[]) => {
            if (events) {
               setEvents(events)
            }
         })
         .finally(() => {
            setLoading(false)
         })
   }, [fieldsOfStudy])

   return { events, loading }
}
export default useUpcomingStreamsByFieldOfStudy
