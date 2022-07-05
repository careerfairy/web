import React, { useEffect, useMemo, useState } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import { usePagination } from "use-pagination-firestore"
import { useAuth } from "../../../../HOCs/AuthProvider"
import EventsPreviewGrid from "./EventsPreviewGrid"
import { useRouter } from "next/router"
import { parseStreamDates } from "../../../../util/serverUtil"
import { useMountedState } from "react-use"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"

const ComingUpNextEvents = ({ limit, serverSideEvents }: Props) => {
   const { isLoggedIn } = useAuth()
   const {
      query: { livestreamId },
   } = useRouter()
   const mounted = useMountedState()

   const [localEvents, setLocalEvents] = useState(
      serverSideEvents?.map((event) => parseStreamDates(event)) || []
   )
   const [eventFromQuery, setEventFromQuery] = useState(null)

   const query = useMemo(() => {
      return livestreamRepo.upcomingEventsQuery()
   }, [])

   const { items: events, isLoading } = usePagination<LivestreamEvent>(query, {
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

   if (!isLoggedIn || !mounted) {
      return (
         <EventsPreviewGrid
            id={"upcoming-events"}
            title={"COMING UP NEXT"}
            type={EventsTypes.comingUp}
            seeMoreLink={"/next-livestreams"}
            loading={isLoading}
            events={localEvents}
         />
      )
   }

   // Only render carousel component on client side, it starts to bug out when SSR is being used
   return (
      <EventsPreview
         id={"upcoming-events"}
         limit={limit}
         title={"COMING UP NEXT"}
         type={EventsTypes.comingUp}
         events={localEvents}
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
