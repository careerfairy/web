import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
} from "./EventsPreviewCarousel"

const config = {
   suspense: false,
   initialData: [],
}

const defaultStyling: EventsCarouselStyling = {
   mainWrapperBoxSx: {
      mt: 2,
   },
}

type Props = {
   limit?: number
   serverSideEvents?: LivestreamEvent[]
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
   if (isLoggedIn) defaultStyling.mainWrapperBoxSx = {}

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
         title={COMING_UP_NEXT_EVENT_TITLE}
         location={"portal-next-livestreams-carousel"}
         events={localEvents}
         seeMoreLink={"/next-livestreams"}
         isRecommended
         styling={defaultStyling}
      />
   )
}
export const COMING_UP_NEXT_EVENT_TITLE = "Upcoming live streams"

export default ComingUpNextEvents
