import React, { useEffect, useMemo, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { formatLivestreamsEvents } from "./utils"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import EventsPreviewCarousel, { EventsTypes } from "./EventsPreviewCarousel"

const config = {
   suspense: false,
   initialData: [],
}

const ComingUpNextEvents = ({ limit, serverSideEvents }: Props) => {
   const { isLoggedIn } = useAuth()
   const {
      query: { livestreamId },
   } = useRouter()

   const [localEvents, setLocalEvents] =
      useState<LivestreamEvent[]>(serverSideEvents)
   const [eventFromQuery, setEventFromQuery] = useState(null)

   const query = useMemo(() => {
      return livestreamRepo.upcomingEventsQuery(
         undefined,
         isLoggedIn ? limit : 80
      )
   }, [isLoggedIn, limit])

   const { data: events } = useFirestoreCollection<LivestreamEvent>(
      query,
      config
   )

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
         localEvents.length && !events?.length
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
      setLocalEvents(newLocalEvents || [])
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [eventFromQuery, events])

   // Only render carousel component on client side, it starts to bug out when SSR is being used
   return (
      <EventsPreviewCarousel
         id={"upcoming-events"}
         title={COMMING_UP_NEXT_EVENT_TITLE}
         type={EventsTypes.comingUp}
         events={formatLivestreamsEvents(localEvents)}
         seeMoreLink={"/next-livestreams"}
         isRecommended
      />
   )
}
export const COMMING_UP_NEXT_EVENT_TITLE = "Upcoming live streams"
interface Props {
   limit?: number
   serverSideEvents?: LivestreamEvent[]
}

export default ComingUpNextEvents
