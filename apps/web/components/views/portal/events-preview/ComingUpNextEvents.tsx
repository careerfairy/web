import React, { useEffect, useMemo, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { formatLivestreamsEvents } from "./utils"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import EventsPreviewCarousel, { EventsTypes } from "./EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"

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

   const eventsCarouselEmblaOptions = useMemo<EmblaOptionsType>(
      () => ({
         axis: "x",
         loop: false,
         align: "center",
         dragThreshold: 0.5,
         dragFree: true,
         inViewThreshold: 0,
      }),
      [events]
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
   }, [eventFromQuery, events])

   // Only render carousel component on client side, it starts to bug out when SSR is being used
   return (
      <EventsPreviewCarousel
         id={"upcoming-events"}
         title={"COMING UP NEXT"}
         type={EventsTypes.comingUp}
         events={formatLivestreamsEvents(localEvents)}
         seeMoreLink={"/next-livestreams"}
         // No need to show loading as these events have already been queried server side
         loading={false}
         options={eventsCarouselEmblaOptions}
         isRecommended
      />
   )
}

interface Props {
   limit?: number
   serverSideEvents?: LivestreamEvent[]
}

export default ComingUpNextEvents
