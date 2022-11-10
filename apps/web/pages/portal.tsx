import React from "react"
import GeneralLayout from "layouts/GeneralLayout"
import HighlightsCarousel from "../components/views/portal/HighlightsCarousel"
import Container from "@mui/material/Container"
import RecommendedEvents from "../components/views/portal/events-preview/RecommendedEvents"
import ComingUpNextEvents from "../components/views/portal/events-preview/ComingUpNextEvents"
import MyNextEvents from "../components/views/portal/events-preview/MyNextEvents"
import WidgetsWrapper from "../components/views/portal/WidgetsWrapper"
import { useAuth } from "../HOCs/AuthProvider"
import { GetServerSideProps } from "next"
import SEO from "../components/util/SEO"
import { highlightRepo, livestreamRepo } from "../data/RepositoryInstances"
import { START_DATE_FOR_REPORTED_EVENTS } from "../data/constants/streamContants"
import { HighLight } from "@careerfairy/shared-lib/dist/highlights/Highlight"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import EventsPreview, {
   EventsTypes,
} from "../components/views/portal/events-preview/EventsPreview"

const PortalPage = ({
   highlights,
   comingUpNextEvents,
   showHighlights,
   pastEvents,
}: Props) => {
   const { authenticatedUser, userData } = useAuth()
   const hasInterests = Boolean(
      authenticatedUser.email || userData?.interestsIds
   )

   return (
      <>
         <SEO
            id={"CareerFairy | Portal"}
            description={
               "To find the greatest virtual career events, use the CareerFairy Portal. Through our events, meet potential future colleagues live and land your dream job!"
            }
            title={"CareerFairy | Portal"}
         />
         <GeneralLayout backgroundColor={"#FFF"} hideNavOnScroll fullScreen>
            <Container disableGutters>
               <WidgetsWrapper>
                  <HighlightsCarousel
                     showHighlights={showHighlights}
                     serverSideHighlights={highlights}
                  />
                  {hasInterests && <RecommendedEvents limit={10} />}
                  <ComingUpNextEvents
                     serverSideEvents={comingUpNextEvents}
                     limit={20}
                  />
                  <MyNextEvents limit={20} />
                  <EventsPreview
                     id={"past-events"}
                     title={"PAST EVENTS"}
                     type={EventsTypes.pastEvents}
                     events={mapFromServerSide(pastEvents)}
                     seeMoreLink={"/next-livestreams?type=pastEvents"}
                     // No need to show loading as these events have already been queried server side
                     loading={false}
                  />
               </WidgetsWrapper>
            </Container>
         </GeneralLayout>
      </>
   )
}

export const getServerSideProps: GetServerSideProps = async () => {
   const [showHighlights, highlights, comingUpNextEvents, pastEvents] =
      await Promise.all([
         highlightRepo.shouldShowHighlightsCarousel(),
         highlightRepo.getHighlights(5),
         livestreamRepo.getUpcomingEvents(20),
         livestreamRepo.getPastEventsFrom({
            fromDate: new Date(START_DATE_FOR_REPORTED_EVENTS),
            limit: 6,
         }),
      ])
   // Parse
   return {
      props: {
         showHighlights,
         ...(highlights && { highlights }),
         ...(comingUpNextEvents && {
            comingUpNextEvents: comingUpNextEvents.map((event) =>
               livestreamRepo.serializeEvent(event)
            ),
         }),
         ...(pastEvents && {
            pastEvents: pastEvents.map((event) => JSON.stringify(event)),
         }),
      },
   }
}

/**
 * To parse the events coming from server side
 */
const mapFromServerSide = (events = []): LivestreamEvent[] => {
   return events.map((event) => JSON.parse(event))
}

type Props = {
   highlights: HighLight[]
   comingUpNextEvents: LivestreamEvent[]
   showHighlights: boolean
   pastEvents: string[]
}

export default PortalPage
