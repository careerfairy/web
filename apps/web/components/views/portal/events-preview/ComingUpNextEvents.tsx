import React, { useEffect, useMemo, useState } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import { usePagination } from "use-pagination-firestore"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { formatLivestreamsEvents } from "./utils"

const ComingUpNextEvents = ({ limit, serverSideEvents }: Props) => {
   const { isLoggedIn } = useAuth()
   const {
      query: { livestreamId },
   } = useRouter()

   const [localEvents, setLocalEvents] =
      useState<LivestreamEvent[]>(serverSideEvents)
   const [eventFromQuery, setEventFromQuery] = useState(null)

   const query = useMemo(() => {
      return livestreamRepo.upcomingEventsQuery()
   }, [])

   const { items: events } = usePagination<LivestreamEvent>(query, {
      limit: isLoggedIn ? limit : 80,
   })

   useEffect(() => {
      if (livestreamId) {
         const unsubscribe = livestreamRepo.listenToSingleEvent(
            livestreamId as string,
            (docSnap) => {
               setEventFromQuery(
                  docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null
               )
            }
         )

         return () => unsubscribe()
      }
   }, [livestreamId])

   useEffect(() => {
      const newLocalEvents =
         localEvents.length && !events.length
            ? [...localEvents]
            : new LivestreamsDataParser(events).filterByNotEndedEvents().get()

      const newEventFromQuery = newLocalEvents.find(
         (event) => event.id === eventFromQuery?.id
      )
      if (newEventFromQuery) {
         newLocalEvents.filter((event) => event.id === newEventFromQuery.id)
      }
      if (eventFromQuery) {
         newLocalEvents.unshift(eventFromQuery)
      }
      setLocalEvents(newLocalEvents)
   }, [eventFromQuery, events])

   // Only render carousel component on client side, it starts to bug out when SSR is being used
   return (
      <EventsPreview
         id={"upcoming-events"}
         limit={limit}
         title={"COMING UP NEXT"}
         type={EventsTypes.comingUp}
         events={formatLivestreamsEvents(localEvents)}
         seeMoreLink={"/next-livestreams"}
         // No need to show loading as these events have already been queried server side
         loading={false}
      />
   )
}

interface Props {
   limit?: number
   serverSideEvents?: LivestreamEvent[]
}

export default ComingUpNextEvents
