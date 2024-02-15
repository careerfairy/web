import React, { useEffect, useMemo, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { formatLivestreamsEvents } from "./utils"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "./EventsPreviewCarousel"
import { sxStyles } from "types/commonTypes"

const config = {
   suspense: false,
   initialData: [],
}
const slideSpacing = 21

const styles = sxStyles({
   arrowIcon: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      ml: 2,
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pr: 2,
      pb: 1,
   },
   description: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 2,
   },
   seeMoreText: {
      color: "text.secondary",
      textDecoration: "underline",
      pr: 1,
   },
   underlined: {
      textDecoration: "underline",
   },
   eventTitle: {
      fontFamily: "Poppins",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "27px",
      color: "black",
   },
   viewport: {
      overflow: "hidden",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
   },
   slide: {
      flex: {
         xs: `0 0 90%`,
         sm: `0 0 45%`,
         md: `0 0 40%`,
         lg: `0 0 30%`,
      },
      minWidth: {
         xs: "310px",
         md: "360px",
      },
      position: "relative",
      height: {
         xs: 363,
         md: 363,
      },
      "&:not(:first-of-type)": {
         paddingLeft: `calc(${slideSpacing}px - 5px)`,
      },
      "&:first-of-type": {
         ml: 0.3,
      },
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
   previewContent: {
      position: "relative",
   },
   mainBox: {
      paddingLeft: 2,
   },
   titleLink: {
      color: "#000",
      "&:hover": {
         color: "#000",
      },
   },
   mainWrapperBox: {
      mt: 2,
   },
})
const defaultStyling: EventsCarouselStyling = {
   compact: true,
   seeMoreSx: styles.seeMoreText,
   eventTitleSx: styles.eventTitle,
   viewportSx: styles.viewport,
   showArrows: true,
   headerAsLink: false,
   padding: true,
   slide: styles.slide,
   title: styles.eventTitle,
   titleVariant: "h6",
   eventsHeader: styles.eventsHeader,
   mainWrapperBoxSx: styles.mainWrapperBox,
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
         title={COMMING_UP_NEXT_EVENT_TITLE}
         type={EventsTypes.COMING_UP}
         events={formatLivestreamsEvents(localEvents)}
         seeMoreLink={"/next-livestreams"}
         isRecommended
         styling={defaultStyling}
      />
   )
}
export const COMMING_UP_NEXT_EVENT_TITLE = "Upcoming live streams"

export default ComingUpNextEvents
