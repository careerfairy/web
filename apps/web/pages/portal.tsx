import React, { useMemo } from "react"
import GeneralLayout from "layouts/GeneralLayout"
import HighlightsCarousel from "../components/views/portal/HighlightsCarousel"
import Container from "@mui/material/Container"
import RecommendedEvents from "../components/views/portal/events-preview/RecommendedEvents"
import ComingUpNextEvents from "../components/views/portal/events-preview/ComingUpNextEvents"
import MyNextEvents from "../components/views/portal/events-preview/MyNextEvents"
import WidgetsWrapper from "../components/views/portal/WidgetsWrapper"
import { useAuth } from "../HOCs/AuthProvider"
import { InferGetServerSidePropsType } from "next"
import SEO from "../components/util/SEO"
import { highlightRepo, livestreamRepo } from "../data/RepositoryInstances"
import { START_DATE_FOR_REPORTED_EVENTS } from "../data/constants/streamContants"
import EventsPreview, {
   EventsTypes,
} from "../components/views/portal/events-preview/EventsPreview"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { mapFromServerSide } from "util/serverUtil"

const PortalPage = ({
   highlights,
   comingUpNextEvents,
   showHighlights,
   pastEvents,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const { authenticatedUser, userData } = useAuth()
   const hasInterests = Boolean(
      authenticatedUser.email || userData?.interestsIds
   )
   const events = useMemo(() => mapFromServerSide(pastEvents), [pastEvents])
   const comingUpNext = useMemo(
      () => mapFromServerSide(comingUpNextEvents),
      [comingUpNextEvents]
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
                  {hasInterests ? <RecommendedEvents limit={10} /> : null}
                  <ComingUpNextEvents
                     serverSideEvents={comingUpNext}
                     limit={20}
                  />
                  <MyNextEvents limit={20} />
                  <EventsPreview
                     id={"past-events"}
                     title={"PAST EVENTS"}
                     type={EventsTypes.pastEvents}
                     events={events}
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

export const getServerSideProps = async () => {
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
            comingUpNextEvents: comingUpNextEvents.map(
               LivestreamPresenter.serializeDocument
            ),
         }),
         ...(pastEvents && {
            pastEvents: pastEvents.map(LivestreamPresenter.serializeDocument),
         }),
      },
   }
}

export default PortalPage
